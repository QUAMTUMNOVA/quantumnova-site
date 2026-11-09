import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../episodes/ep004/EP004-shot-queue-data.mjs';
// Temporary private EP004 original clip retrieval. Remove after verified edit transfer.
const TOKEN_SHA256='fc2247a25053dc9adb85a0a661fde73fd57198fe16f9639fd8d280636c5a27a6';
const CHUNK=2000000;
const valid=new Set(SHOTS.map(s=>s.id));
const headers={'Cache-Control':'private,no-store,max-age=0','X-Robots-Tag':'noindex,nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
export default async function(request){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers});
 const auth=request.headers.get('authorization')||'';
 const token=auth.startsWith('Bearer ')?auth.slice(7):'';
 if(!/^[a-f0-9]{64}$/.test(token))return new Response('Unauthorized',{status:401,headers});
 const digest=createHash('sha256').update(token).digest('hex');
 if(!timingSafeEqual(Buffer.from(digest),Buffer.from(TOKEN_SHA256)))return new Response('Unauthorized',{status:401,headers});
 const q=new URL(request.url).searchParams;
 const id=q.get('shot')||'',part=Number(q.get('part')||'0');
 if(!valid.has(id)||!Number.isInteger(part)||part<0||part>100)return new Response('Invalid request',{status:400,headers});
 try{
  const content=await getStore('btk-ep004-videos').get('original/'+id+'.mp4',{type:'arrayBuffer'});
  if(!content)return new Response('Not archived',{status:404,headers});
  const b=Buffer.from(content),count=Math.ceil(b.length/CHUNK);
  if(part>=count)return new Response('No part',{status:416,headers});
  const chunk=b.subarray(part*CHUNK,Math.min((part+1)*CHUNK,b.length));
  return new Response(chunk,{status:200,headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(chunk.length),'X-Clip-Total':String(b.length),'X-Clip-Parts':String(count),'X-Clip-Part':String(part)}});
 }catch{return new Response('Source temporarily unavailable',{status:503,headers});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:1500}};
