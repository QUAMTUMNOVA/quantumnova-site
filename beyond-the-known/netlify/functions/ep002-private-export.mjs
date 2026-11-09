import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../episodes/ep002/EP002-shot-queue-data.mjs';
// TEMPORARY read-only authenticated EP002 assembly export. All source media private.
// Deliberately short-lived: remove this route when master export is complete.
const TOKEN_SHA256='30865b3329e9ebf0971411722c664140c017c2bbaf1626ddb30a3cf8e1418498';
const CHUNK=2000000;
const VALID=new Set(SHOTS.map(s=>s.id));
const noStore={'Cache-Control':'private, no-store, max-age=0','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'};
export default async function(request){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers:noStore});
 const auth=request.headers.get('authorization')||'';
 const token=auth.startsWith('Bearer ')?auth.slice(7):'';
 if(token.length!==64||!/^[a-f0-9]{64}$/.test(token))return new Response('Not authorized',{status:401,headers:noStore});
 const digest=createHash('sha256').update(token).digest('hex');
 if(!timingSafeEqual(Buffer.from(digest,'utf8'),Buffer.from(TOKEN_SHA256,'utf8')))
   return new Response('Not authorized',{status:401,headers:noStore});
 const u=new URL(request.url), id=u.searchParams.get('shot')||'';
 if(!VALID.has(id))return new Response('Unknown shot',{status:404,headers:noStore});
 const part=Number(u.searchParams.get('part')||'0');
 if(!Number.isInteger(part)||part<0||part>100)return new Response('Invalid part',{status:400,headers:noStore});
 try{
   const store=getStore('btk-ep002-videos');
   const payload=await store.get('original/'+id+'.mp4',{type:'arrayBuffer'});
   if(!payload)return new Response('Video not yet archived',{status:404,headers:noStore});
   const bytes=Buffer.from(payload);
   const count=Math.ceil(bytes.length/CHUNK);
   if(part>=count)return new Response('No such part',{status:416,headers:noStore});
   const chunk=bytes.subarray(part*CHUNK,Math.min(bytes.length,(part+1)*CHUNK));
   return new Response(chunk,{status:200,headers:{...noStore,
    'Content-Type':'application/octet-stream',
    'Content-Length':String(chunk.length),
    'X-EP002-Total-Bytes':String(bytes.length),
    'X-EP002-Parts':String(count),'X-EP002-Part':String(part),
    'X-Content-Type-Options':'nosniff'}});
 }catch{
   return new Response('Private export unavailable',{status:503,headers:noStore});
 }
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:1500}};
