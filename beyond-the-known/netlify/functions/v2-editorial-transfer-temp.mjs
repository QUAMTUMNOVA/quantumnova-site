import {getStore} from '@netlify/blobs';
// Temporary editorial media transfer endpoint for QNova-generated EP001 V2 assets.
// Returns media CDN links only (never API keys or internal job tokens).
export default async function(req){
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 const store=getStore('btk-production-ep001-v2');
 const ids=['110','111','112','113','114','115'];
 const items=await Promise.all(ids.map(async id=>{
   const x=await store.get('jobs/'+id,{type:'json'});
   return {id,state:x?.state||'queued',
      result_url:x?.state==='completed'&&typeof x.result_url==='string'?x.result_url:null};
 }));
 return Response.json({episode:'EP001',variant:'V2',items},{headers:{
  'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow'
 }});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:8}};
