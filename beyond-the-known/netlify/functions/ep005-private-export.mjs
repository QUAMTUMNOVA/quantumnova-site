import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../episodes/ep005/EP005-shot-queue-data.mjs';
// Temporary authenticated private source export, DELETE after archival footage has been copied & verified.
const TOKEN_SHA256='1b0aeb2f3e633c0dbd82c25eed0252dab101331767eaf00762b144b820ecc765',CHUNK=2000000;
const ids=new Set(SHOTS.map(x=>x.id));
const headers={'Cache-Control':'private,no-store,max-age=0','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex,nofollow','X-Content-Type-Options':'nosniff'};
export default async function(request){
 if(request.method!=='GET')return new Response('Not allowed',{status:405,headers});
 const auth=request.headers.get('authorization')||'';
 const token=auth.startsWith('Bearer ')?auth.slice(7):'';
 if(!/^[a-f0-9]{64}$/.test(token))return new Response('Unauthorized',{status:401,headers});
 const digest=createHash('sha256').update(token).digest('hex');
 if(!timingSafeEqual(Buffer.from(digest),Buffer.from(TOKEN_SHA256)))return new Response('Unauthorized',{status:401,headers});
 const q=new URL(request.url).searchParams,id=q.get('shot')||'',part=Number(q.get('part')||'0');
 if(!ids.has(id)||!Number.isInteger(part)||part<0||part>50)return new Response('Invalid request',{status:400,headers});
 try{
 const src=await getStore('btk-ep005-videos').get('original/'+id+'.mp4',{type:'arrayBuffer'});
 if(!src)return new Response('Not archived',{status:404,headers});
 const b=Buffer.from(src),n=Math.ceil(b.length/CHUNK);
 if(part>=n)return new Response('Range missing',{status:416,headers});
 const chunk=b.subarray(part*CHUNK,Math.min((part+1)*CHUNK,b.length));
 return new Response(chunk,{status:200,headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(chunk.length),'X-Clip-Total':String(b.length),'X-Clip-Parts':String(n),'X-Clip-Part':String(part)}});
 }catch{return new Response('Source unavailable',{status:503,headers});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:1800}};
