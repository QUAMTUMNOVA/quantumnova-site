import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../shorts/scenario-files/sf002/SF002-shot-queue-data.mjs';
// Temporary private-only original footage export. Remove after successful full copy.
const TOKEN_SHA256='83476be38a64277663700eaf1d29d0e420c12cef15afbe266123ee415409c944';
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
 if(!valid.has(id)||!Number.isInteger(part)||part<0||part>35)return new Response('Invalid request',{status:400,headers});
 try{
  const content=await getStore('btk-sf002-videos').get('original/'+id+'.mp4',{type:'arrayBuffer'});
  if(!content)return new Response('Not archived',{status:404,headers});
  const b=Buffer.from(content),count=Math.ceil(b.length/CHUNK);
  if(part>=count)return new Response('No part',{status:416,headers});
  const chunk=b.subarray(part*CHUNK,Math.min((part+1)*CHUNK,b.length));
  return new Response(chunk,{status:200,headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(chunk.length),'X-Clip-Total':String(b.length),'X-Clip-Parts':String(count),'X-Clip-Part':String(part)}});
 }catch{return new Response('Source temporarily unavailable',{status:503,headers});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:300}};
