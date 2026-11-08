import {getStore} from '@netlify/blobs';
const ids=Array.from({length:24},(_,i)=>String(201+i));
export default async function(req){
 if(req.method!=='GET')return new Response('method not allowed',{status:405});
 const store=getStore('btk-ep001-v3');
 const items=await Promise.all(ids.map(async id=>{
   const row=await store.get('shot/'+id,{type:'json'});
   return {id,beat:row?.beat||null,state:row?.state||'planned'};
 }));
 const counts=items.reduce((o,x)=>({...o,[x.state]:(o[x.state]||0)+1}),{});
 return Response.json({episode:'EP001',version:'V3',visual_beat_count:115,new_video_generation_target:24,
  counts,items,planned_cost_max_usd:36,model:'Wan 3.0, 5 seconds, 720p',
  narration:'locked',soundtrack:'locked',edit_stage:'narration-first beat sheet and alignment',
  ready_for_publication:false},
  {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow'}});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:25}};
