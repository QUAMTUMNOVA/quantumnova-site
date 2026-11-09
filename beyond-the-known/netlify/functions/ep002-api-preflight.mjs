// EP002: safe, read-only developer-API pricing preflight. No generation, no media creation, no publication.
const MODEL='kling-video/v3.0/std/text-to-video';
const SCRIPTED_MOVING_SHOTS=153;
const PARAMS={
  prompt:"Documentary reconstruction of Trajanic Rome circa AD 110, a lone Roman porter walking along a busy stone-paved street, natural cinematic camera drift, authentic tunics and architecture, no text or modern objects.",
  duration:5,
  aspect_ratio:"16:9",
  sound:"off",
  multi_shots:false,
  cfg_scale:0.5
};
export default async function(request){
 if(request.method!=='GET')return new Response("Method not allowed",{status:405});
 const key=Netlify.env.get('HF_KEY');
 if(!key)return Response.json({api_key_configured:false,quote_ready:false},{status:503,headers:{"Cache-Control":"no-store"}});
 try{
  const response=await fetch('https://api.higgsfield.ai/estimate/'+MODEL,{
   method:'POST',
   headers:{"Authorization":"Key "+key,"Content-Type":"application/json","Accept":"application/json"},
   body:JSON.stringify(PARAMS),signal:AbortSignal.timeout(20000)
  });
  const result=await response.json().catch(()=>({}));
  const estimate=Number(result.usd);
  const quote_ready=response.ok&&Number.isFinite(estimate)&&estimate>0;
  return Response.json({
   episode:"EP002",mode:"API_COST_PREFLIGHT_ONLY",submitted:false,publication:false,
   model:MODEL,duration_seconds:5,aspect_ratio:"16:9",audio:"off",shots:SCRIPTED_MOVING_SHOTS,
   quote_ready,quote_http_status:response.status,
   five_second_shot_usd:quote_ready?Number(estimate.toFixed(4)):null,
   153_shot_estimate_usd:quote_ready?Number((estimate*SCRIPTED_MOVING_SHOTS).toFixed(2)):null,
   // Do not reveal request internals or provider diagnostics to site visitors.
   note:quote_ready?"Estimate only. No jobs submitted. Live API balance is not reported by this endpoint.":"Estimate unavailable; no jobs submitted."
  },{status:200,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"}});
 }catch{
  return Response.json({episode:"EP002",mode:"API_COST_PREFLIGHT_ONLY",quote_ready:false,submitted:false,publication:false,error:"preflight_network_failure"},{status:502,headers:{"Cache-Control":"no-store"}});
 }
}
export const config={rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:3}};
