import {getStore} from '@netlify/blobs';
const IDS=Array.from({length:46},(_,i)=>String(301+i));
export default async function(req){
 if(req.method!=='GET')return new Response('method not allowed',{status:405});
 const store=getStore('btk-ep001-v4');
 const items=await Promise.all(IDS.map(async id=>{
 const j=await store.get('shot/'+id,{type:'json'});
 return {id,chapter:j?.chapter||null,state:j?.state||'planned',archived:!!j?.stored_asset};
 }));
 const counts=items.reduce((o,i)=>(o[i.state]=(o[i.state]||0)+1,o),{});
 return Response.json({episode:'EP001',version:'V4',target_new_videos:46,counts,items,
  spend_planning_usd:69,published:false,editorial_status:'no-repeat timeline rebuild, source shots under QC',
  owner_approval_required:true},{headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow'}});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:20}};
