import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
// Private read-only owner review — no generate/edit/publish operations.
// Token is 256-bit random and not stored in source; only its SHA-256 digest is here.
const reference='a4a23be7f7605af94ddff3f033f5a7d191298fd182cf237a7a3b1830d205a78c';
const authorized=(req)=>{
  const token=req.headers.get('x-btk-review-token')||'';
  if(token.length!==64 || !/^[0-9a-f]+$/i.test(token))return false;
  const digest=createHash('sha256').update(token,'utf8').digest('hex');
  return timingSafeEqual(Buffer.from(digest),Buffer.from(reference));
};
export default async function(req){
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 if(!authorized(req))return Response.json({error:'unauthorized'}, {status:401,headers:{'Cache-Control':'no-store'}});
 const s=getStore('btk-production-ep001');const jobs=[];
 for(const id of ['001','003','006']){
  const j=await s.get('jobs/EP001/'+id,{type:'json'});
  jobs.push(j?{id:j.id,label:j.label,kind:j.kind,state:j.state,
    result_url:j.result_url||null,request_id:j.request_id||null,updated_at:j.updated_at||null}:{id,state:'not_started'});
 }
 const run=await s.get('run',{type:'json'});
 return Response.json({episode:'EP001',run:run||null,jobs,autopublish:false,approval_required:true},
  {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'}});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:12}};
