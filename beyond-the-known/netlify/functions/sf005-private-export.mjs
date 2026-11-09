import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../shorts/scenario-files/sf005/SF005-shot-queue-data.mjs';
// Temporary bearer-authenticated exact original clip export. DELETE after complete verified transfer.
const HASH='5cad6db891b14bb9176f473af7f15f67837e60c58d243fbf3df5c270d95aa209';
const CHUNK=2000000, valid=new Set(SHOTS.map(x=>x.id));
const headers={'Cache-Control':'private,no-store,max-age=0','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex,nofollow','X-Content-Type-Options':'nosniff'};
export default async function(request){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers});
 const raw=request.headers.get('authorization')||'';
 const token=raw.startsWith('Bearer ')?raw.slice(7):'';
 if(!/^[a-f0-9]{64}$/.test(token))return new Response('Unauthorized',{status:401,headers});
 const digest=createHash('sha256').update(token).digest('hex');
 if(!timingSafeEqual(Buffer.from(HASH),Buffer.from(digest)))return new Response('Unauthorized',{status:401,headers});
 const q=new URL(request.url).searchParams,id=q.get('shot')||'',part=Number(q.get('part')||'0');
 if(!valid.has(id)||!Number.isInteger(part)||part<0||part>35)return new Response('Invalid request',{status:400,headers});
 try{
 const raw=await getStore('btk-sf005-videos').get('original/'+id+'.mp4',{type:'arrayBuffer'});
 if(!raw)return new Response('Not archived',{status:404,headers});
 const b=Buffer.from(raw),count=Math.ceil(b.length/CHUNK);
 if(part>=count)return new Response('No part',{status:416,headers});
 const bytes=b.subarray(part*CHUNK,Math.min((part+1)*CHUNK,b.length));
 return new Response(bytes,{status:200,headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(bytes.length),'X-Clip-Total':String(b.length),'X-Clip-Parts':String(count),'X-Clip-Part':String(part)}});
 }catch{return new Response('Source unavailable',{status:503,headers});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:320}};
