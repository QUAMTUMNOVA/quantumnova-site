import {getStore} from '@netlify/blobs';
import {SHOTS} from '../../shorts/scenario-files/sf002/SF002-shot-queue-data.mjs';
export default async function(request){
 if(request.method!=='GET')return new Response("Method not allowed",{status:405});
 const store=getStore('btk-sf002-api');
 const all=await Promise.all(SHOTS.map(s=>store.get('shot/'+s.id,{type:'json'})));
 const first=all.slice(0,3),pilot=await store.get('pilot_status',{type:'json'});
 const states=all.reduce((o,row)=>(o[row?.state||'planned']=(o[row?.state||'planned']||0)+1,o),{});
 const archived=all.filter(row=>Boolean(row?.stored_asset)).length;
 const submitted=all.filter(row=>Boolean(row?.request_id)).length;
 const quote_total=all.reduce((a,row)=>a+(Number(row?.quote_usd)||0),0);
 return Response.json({
  episode:'SF002',
  stage:archived===SHOTS.length?'all_raw_shots_archived_final_edit_pending':submitted>=SHOTS.length?'raw_shots_submitted':'raw_shot_generation',
  shots_target:SHOTS.length,shots_submitted:submitted,shots_completed:states.completed||0,
  shots_archived_privately:archived,
  pilot:{target:3,submitted:first.filter(x=>x?.request_id).length,completed:first.filter(x=>x?.state==='completed').length,archived:first.filter(x=>x?.stored_asset).length,estimated_spend_usd:pilot?.submitted_estimate_usd??null},
  counts:states,api_spend_quoted_usd:Number(quote_total.toFixed(2)),
  maximum_episode_video_estimate_usd:3,
  public_release:false,private_full_episode_ready:false,
  note:'Footage generation is not the assembled documentary. This endpoint exposes no media URLs, credentials or provider request IDs.'
 },{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"}});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:10}};
