import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../shorts/scenario-files/sf007/SF007-shot-queue-data.mjs';
const HASH='75a143e13678471d92ba462db10ee24cf979cd9f204aba23a33f6f697f743a7d', CHUNK=2000000;
const ids=new Set(SHOTS.map(s=>s.id));
const h={'Cache-Control':'private,no-store,max-age=0','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex,nofollow','X-Content-Type-Options':'nosniff'};
export default async function(request){
 if(request.method!=='GET')return new Response('Not allowed',{status:405,headers:h});
 const a=request.headers.get('authorization')||'';
 const token=a.startsWith('Bearer ')?a.slice(7):'';
 if(!/^[a-f0-9]{64}$/.test(token))return new Response('Unauthorized',{status:401,headers:h});
 const v=createHash('sha256').update(token).digest('hex');
 if(!timingSafeEqual(Buffer.from(v),Buffer.from(HASH)))return new Response('Unauthorized',{status:401,headers:h});
 const q=new URL(request.url).searchParams,id=q.get('shot')||'',part=Number(q.get('part')||'0');
 if(!ids.has(id)||!Number.isInteger(part)||part<0||part>35)return new Response('Bad request',{status:400,headers:h});
 try{
 const data=await getStore('btk-sf007-videos').get('original/'+id+'.mp4',{type:'arrayBuffer'});
 if(!data)return new Response('Not archived',{status:404,headers:h});
 const b=Buffer.from(data),count=Math.ceil(b.length/CHUNK);
 if(part>=count)return new Response('Bad range',{status:416,headers:h});
 const chunk=b.subarray(part*CHUNK,Math.min((part+1)*CHUNK,b.length));
 return new Response(chunk,{status:200,headers:{...h,'Content-Type':'application/octet-stream','Content-Length':String(chunk.length),'X-Clip-Total':String(b.length),'X-Clip-Parts':String(count),'X-Clip-Part':String(part)}});
 }catch{return new Response('Not ready',{status:503,headers:h});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:320}};
