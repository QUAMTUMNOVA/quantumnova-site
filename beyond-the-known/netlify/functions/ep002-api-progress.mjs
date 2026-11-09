import {getStore} from '@netlify/blobs';
import {SHOTS} from '../../episodes/ep002/EP002-shot-queue-data.mjs';
export default async function(request){
 if(request.method!=='GET')return new Response("Method not allowed",{status:405});
 const store=getStore('btk-ep002-api');
 const ids=SHOTS.slice(0,3);
 const jobs=await Promise.all(ids.map(s=>store.get('shot/'+s.id,{type:'json'})));
 const status=await store.get('pilot_status',{type:'json'});
 const counts=jobs.reduce((a,j)=>(a[j?.state||'planned']=(a[j?.state||'planned']||0)+1,a),{});
 return Response.json({
  episode:'EP002',stage:'api_video_pilot',pilot_target:ids.length,full_episode_target:SHOTS.length,
  submitted:jobs.filter(j=>Boolean(j?.request_id)).length,
  completed:jobs.filter(j=>j?.state==='completed').length,
  privately_archived:jobs.filter(j=>Boolean(j?.stored_asset)).length,
  counts,quote_spend_usd:status?.submitted_estimate_usd??null,
  public_release:false,private_full_episode_ready:false,
  note:'This endpoint does not disclose video URLs or API credentials; pilot footage is not a finished film.'
 },{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"}});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:10}};
