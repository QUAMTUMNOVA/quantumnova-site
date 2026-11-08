import {getStore} from '@netlify/blobs';
// BTK V3 action and consequences batch, only funded QNova developer API.
// 4 WAN 3.0 five-second videos @ US$1.50 conservative per-video planning cost = US$6.
// No retry after uncertain submission, no credit-funded plugin video.
const scenes=[{"id":"225","beat":"B006","quote":"On a motorway, vehicles collide while others slow to a halt","subject":"5 seconds, grounded catastrophic scene of a large empty motorway at morning. Two driverless cars collide at moderate speed near a heavy lorry, a brief realistic petrol spill ignites in a localized orange flame with a small pressure flash and black-grey smoke, no giant Hollywood explosion and no people or bodies. Start with collision and end with realistic spreading roadside fire. Steady roadside 35mm documentary camera, natural physics and coherent car geometry."},{"id":"226","beat":"B032","quote":"Without firefighters some fires could become devastating","subject":"5 seconds, observational realistic urban street after humanity disappeared. Burning crashed van beside closed small shop, fire from vehicle fuel intensifies and a short localized flash of flame bursts through a shattered side window, smoke billows and flames reflect on wet road, unattended fire spreading as no one responds. No humans no bodies no cartoon explosion, stationary photorealistic documentary camera."},{"id":"227","beat":"B023","quote":"Protective equipment can disconnect generators or sections of the network","subject":"5 seconds, high-voltage substation with nobody in sight, a genuine electrical fault produces a brief bright blue-white arcing flash at one switchgear isolator and a small smoke puff, protective breakers open and lights dim, NO massive explosion, physically credible real industrial equipment, twilight, smooth wide-angle tracking with natural exposure."},{"id":"228","beat":"B030","quote":"On factory floors robots might complete a cycle before shutting down","subject":"5 seconds inside a deserted automated industrial processing hall: an unattended machine cycles, a damaged bearing emits sparks and causes a brief localized mechanical fault and smoke, red warning beacon flashes then equipment halts, realistic safe distance documentary camera, no fictional machinery, no people, no unrealistic building-wide explosion."}];
export default async function(){
 const key=Netlify.env.get('HF_KEY');if(!key)return;
 const s=getStore('btk-ep001-v3');
 let n=0;
 for(const scene of scenes){
  if(n>=2)break;
  const row='shot/'+scene.id;
  const claim=await s.setJSON(row,{id:scene.id,beat:scene.beat,state:'submitting',updated_at:new Date().toISOString()},{onlyIfNew:true});
  if(!claim.modified){
    const previous=await s.get(row,{type:'json'});
    if(['failed','rejected','outcome_unknown'].includes(previous?.state))break;
    continue;
  }
  try{
    const response=await fetch('https://api.higgsfield.ai/alibaba/wan-3.0/text-to-video',{
      method:'POST',headers:{Authorization:'Key '+key,Accept:'application/json','Content-Type':'application/json'},
      body:JSON.stringify({duration:5,resolution:'720p',aspect_ratio:'16:9',generate_audio:false,
        prompt:'Premium scientifically grounded photorealistic documentary footage. A single continuous coherent shot. '+scene.subject+' Avoid morphing objects, unrealistic fireballs, logos, text, subtitles.'}),
      signal:AbortSignal.timeout(25000)});
    const data=await response.json().catch(()=>({}));
    const request_id=data.request_id||null;
    const state=response.ok&&request_id?'submitted':response.ok?'outcome_unknown':'rejected';
    await s.setJSON(row,{id:scene.id,beat:scene.beat,narration:scene.quote,state,
      request_id,http_status:response.status,estimated_max_usd:1.5,updated_at:new Date().toISOString()});
    if(state!=='submitted')break;n++;
  }catch(e){
    await s.setJSON(row,{id:scene.id,beat:scene.beat,narration:scene.quote,state:'outcome_unknown',updated_at:new Date().toISOString()});break;
  }
 }
 console.info('BTK V3 incident visuals submitted: '+n+' this invocation');
}
export const config={schedule:'*/2 * * * *'};
