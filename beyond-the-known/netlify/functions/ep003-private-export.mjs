import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../episodes/ep003/EP003-shot-queue-data.mjs';
// Temporary read-only authentication for final EP003 picture assembly.
// Delete route immediately after private source clips have been exported.
const TOKEN_SHA256='14d0c942e05cbc3522541935a98b87c59bb9f685453cf98abb0cacc8931415d9';
const PART_BYTES=2000000;
const allowed=new Set(SHOTS.map(s=>s.id));
const headers={'Cache-Control':'private, no-store, max-age=0','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
export default async function(request){
 if(request.method!=='GET')return new Response('Not allowed',{status:405,headers});
 const auth=request.headers.get('authorization')||'';
 const token=auth.startsWith('Bearer ')?auth.substring(7):'';
 if(!/^[a-f0-9]{64}$/.test(token))return new Response('Not authorized',{status:401,headers});
 const digest=createHash('sha256').update(token).digest('hex');
 if(!timingSafeEqual(Buffer.from(digest),Buffer.from(TOKEN_SHA256)))return new Response('Not authorized',{status:401,headers});
 const params=new URL(request.url).searchParams;
 const id=params.get('shot')||'',part=Number(params.get('part')||'0');
 if(!allowed.has(id))return new Response('Unknown shot',{status:404,headers});
 if(!Number.isInteger(part)||part<0||part>100)return new Response('Invalid part',{status:400,headers});
 try{
   const store=getStore('btk-ep003-videos');
   const object=await store.get('original/'+id+'.mp4',{type:'arrayBuffer'});
   if(!object)return new Response('Not archived',{status:404,headers});
   const b=Buffer.from(object),n=Math.ceil(b.length/PART_BYTES);
   if(part>=n)return new Response('No such part',{status:416,headers});
   const out=b.subarray(part*PART_BYTES,Math.min((part+1)*PART_BYTES,b.length));
   return new Response(out,{status:200,headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(out.length),'X-EP003-Total-Bytes':String(b.length),'X-EP003-Parts':String(n),'X-EP003-Part':String(part)}});
 }catch{return new Response('Private source temporarily unavailable',{status:503,headers});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:1500}};
