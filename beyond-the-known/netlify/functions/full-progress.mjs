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
    narration:'not_started',rough_cut:'not_started',publication:'disabled'},
    {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:20}};
