import {getStore} from '@netlify/blobs';
const ids=["002","004","005","007","009","010","012","013","014","015","017","019","020","023","026","027","008","011","016","018","021","022","024","025","028","029","030","031","032","033","034"];
export default async function(req){
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 const store=getStore('btk-production-ep001');
 const run=await store.get('full-production-status',{type:'json'});
 const lock=await store.get('full-production-lock',{type:'json'});
 const shots=await Promise.all(ids.map(async id=>{
   const item=await store.get('full/jobs/'+id,{type:'json'});
   return {id,state:item?.state||'planned',type:item?.kind||null};
 }));
 const counts=shots.reduce((all,shot)=>({...all,[shot.state]:(all[shot.state]||0)+1}),{});
 return Response.json({episode:'EP001',production:run?.state||lock?.state||'not_started',
    completed:counts.completed||0,total:ids.length,counts,shots,
    additional_estimated_max_usd:29.25,approved_for_youtube:false,
    narration:'completed_9_sections',rough_cut:'v4_full_no_repeats_ready_for_review',review_url:'https://d2ol7oe51mr4n9.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/8d74c128-f554-4d7e-b52b-d76b6b9b4ff8.mp4',runtime_seconds:663.961,visual_assets_used:127,visible_reused_source_count:0,v4_generated_motion_scenes:46,editorial_cues:127,publication:'approval_required'},
    {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:20}};
