import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
import {SHOTS} from '../../shorts/scenario-files/sf001/SF001-shot-queue-data.mjs';
// Temporary secure read-only private original shot export, revoke after export.
const TOKEN_SHA256='09174f714a3d301583e99c97265ba14957d7a4891e6941133676f550f0b56702';
const CHUNK=2000000;
const ids=new Set(SHOTS.map(x=>x.id));
const headers={'Cache-Control':'private,no-store,max-age=0','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex,nofollow','X-Content-Type-Options':'nosniff'};
export default async function(request){
 if(request.method!=='GET')return new Response('Not allowed',{status:405,headers});
 const auth=request.headers.get('authorization')||'';
 const token=auth.startsWith('Bearer ')?auth.slice(7):'';
 if(!/^[a-f0-9]{64}$/.test(token))return new Response('Unauthorised',{status:401,headers});
 const digest=createHash('sha256').update(token).digest('hex');
 if(!timingSafeEqual(Buffer.from(digest),Buffer.from(TOKEN_SHA256)))return new Response('Unauthorised',{status:401,headers});
 const q=new URL(request.url).searchParams;
 const id=q.get('shot')||'',part=Number(q.get('part')||'0');
 if(!ids.has(id)||!Number.isInteger(part)||part<0||part>35)return new Response('Bad request',{status:400,headers});
 try{
  const src=await getStore('btk-sf001-videos').get('original/'+id+'.mp4',{type:'arrayBuffer'});
  if(!src)return new Response('Not archived',{status:404,headers});
  const b=Buffer.from(src),n=Math.ceil(b.length/CHUNK);
  if(part>=n)return new Response('Range missing',{status:416,headers});
  const bytes=b.subarray(part*CHUNK,Math.min((part+1)*CHUNK,b.length));
  return new Response(bytes,{status:200,headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(bytes.length),'X-Clip-Total':String(b.length),'X-Clip-Parts':String(n),'X-Clip-Part':String(part)}});
 }catch{return new Response('Not ready',{status:503,headers});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:300}};
