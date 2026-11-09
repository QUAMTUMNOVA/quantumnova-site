import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../episodes/ep007/EP007-shot-queue-data.mjs';
// TEMPORARY bearer-authenticated private source transfer for finished 60-shot EP007.
// Remove this function immediately after verified editor transfer.
const HASH='20740390c0cb56b2b7e8840e21da1cbebf98a586fe04fefabfcfe6c1ce59db0e';
const CHUNK=2000000, valid=new Set(SHOTS.map(x=>x.id));
const headers={'Cache-Control':'private,no-store,max-age=0','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex,nofollow','X-Content-Type-Options':'nosniff'};
export default async function(request){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers});
 const h=request.headers.get('authorization')||'';
 const token=h.startsWith('Bearer ')?h.slice(7):'';
 if(!/^[a-f0-9]{64}$/.test(token))return new Response('Unauthorized',{status:401,headers});
 const digest=createHash('sha256').update(token).digest('hex');
 if(!timingSafeEqual(Buffer.from(HASH),Buffer.from(digest)))return new Response('Unauthorized',{status:401,headers});
 const q=new URL(request.url).searchParams;
 const id=q.get('shot')||'',part=Number(q.get('part')||'0');
 if(!valid.has(id)||!Number.isInteger(part)||part<0||part>80)return new Response('Invalid request',{status:400,headers});
 try{
  const raw=await getStore('btk-ep007-videos').get('original/'+id+'.mp4',{type:'arrayBuffer'});
  if(!raw)return new Response('Not archived',{status:404,headers});
  const data=Buffer.from(raw),count=Math.ceil(data.length/CHUNK);
  if(part>=count)return new Response('No part',{status:416,headers});
  const bytes=data.subarray(part*CHUNK,Math.min((part+1)*CHUNK,data.length));
  return new Response(bytes,{status:200,headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(bytes.length),'X-Clip-Total':String(data.length),'X-Clip-Parts':String(count),'X-Clip-Part':String(part)}});
 }catch{return new Response('Temporarily unavailable',{status:503,headers});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:1000}};
