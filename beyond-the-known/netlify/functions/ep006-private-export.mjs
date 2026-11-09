import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../episodes/ep006/EP006-shot-queue-data.mjs';
// Temporary private 71-shot export, bearer-authenticated; DELETE after editor receives all clips.
const TOKEN_SHA256='449cff2c5d8515d1cfc278412ede2c5ac33fec4cb25be0cb18420941dfe1c799', CHUNK=2000000;
const valid=new Set(SHOTS.map(s=>s.id));
const headers={'Cache-Control':'private,no-store,max-age=0','X-Robots-Tag':'noindex,nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
export default async function(request){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers});
 const raw=request.headers.get('authorization')||'',token=raw.startsWith('Bearer ')?raw.slice(7):'';
 if(!/^[a-f0-9]{64}$/.test(token))return new Response('Unauthorized',{status:401,headers});
 const d=createHash('sha256').update(token).digest('hex');
 if(!timingSafeEqual(Buffer.from(d),Buffer.from(TOKEN_SHA256)))return new Response('Unauthorized',{status:401,headers});
 const q=new URL(request.url).searchParams,id=q.get('shot')||'',part=Number(q.get('part')||'0');
 if(!valid.has(id)||!Number.isInteger(part)||part<0||part>100)return new Response('Invalid request',{status:400,headers});
 try{
 const content=await getStore('btk-ep006-videos').get('original/'+id+'.mp4',{type:'arrayBuffer'});
 if(!content)return new Response('Not archived',{status:404,headers});
 const b=Buffer.from(content),count=Math.ceil(b.length/CHUNK);
 if(part>=count)return new Response('No part',{status:416,headers});
 const chunk=b.subarray(part*CHUNK,Math.min((part+1)*CHUNK,b.length));
 return new Response(chunk,{status:200,headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(chunk.length),'X-Clip-Total':String(b.length),'X-Clip-Parts':String(count),'X-Clip-Part':String(part)}});
 }catch{return new Response('Source unavailable',{status:503,headers});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:1500}};
