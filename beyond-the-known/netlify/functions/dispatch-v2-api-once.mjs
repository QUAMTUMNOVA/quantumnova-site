import {getStore} from '@netlify/blobs';
// QNova Beyond the Known EP001 V2 — one-time API-only video generation.
// The 6 planned WAN 3.0 shots are cost-budgeted at up to US$1.50 each (US$9 planning ceiling).
// A one-time queue lock prevents a second run. Failed / ambiguous submissions are never retried automatically.
// No public triggers; this is a Netlify scheduled function only.
const shots=[{"id":"110","subject":"Unattended server room after humanity vanishes. Rows of rack servers, cooling fans and green lights; some racks dim as backup supply fails. Smooth moving documentary camera, grounded industrial realism."},{"id":"111","subject":"Empty modern train station with a commuter train slowly approaching an otherwise deserted platform, automatic safety braking smoothly stopping the train, physically plausible motion and no people."},{"id":"112","subject":"Darkened large city from a distant hill at dusk, patches of building lights shutting down section by section as power grid protection trips; realistic urban geography and atmospheric haze, stable drone panorama."},{"id":"113","subject":"Empty water-treatment facility with giant sedimentation tanks, circulation slowly slowing as pumps cease, quiet grey morning with no operators, slow overhead cinematic documentary move."},{"id":"114","subject":"Night-time city seen from a high-rise window with streetlights now extinguished and increasingly visible stars, realistic twilight transition, slow observational camera move, no people."},{"id":"115","subject":"First-year abandoned suburban garden with rainwater overflowing an untended gutter and seeping beneath roof tiles, moss and young plants in cracks, highly realistic macro-to-medium tracking shot."}];
const maxPlanningUsd=9;
export default async function(){
  const key=Netlify.env.get('HF_KEY');
  if(!key)return;
  const store=getStore('btk-production-ep001-v2');
  const lock=await store.setJSON('v2-start',{state:'started',planned_max_usd:maxPlanningUsd,created_at:new Date().toISOString()},{onlyIfNew:true});
  if(!lock.modified)return;
  let completedSubmissions=0;
  for(const shot of shots){
    const recordKey='jobs/'+shot.id;
    await store.setJSON(recordKey,{id:shot.id,state:'submitting',description:shot.subject,updated_at:new Date().toISOString()},{onlyIfNew:true});
    try{
      const response=await fetch('https://api.higgsfield.ai/alibaba/wan-3.0/text-to-video',{
        method:'POST',
        headers:{Authorization:'Key '+key,'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({duration:5,resolution:'720p',aspect_ratio:'16:9',generate_audio:false,
          prompt:'Photorealistic scientific documentary, physically realistic, natural detailed textures and lighting, restrained smooth camera movement. '+shot.subject+' One continuous 5-second shot; 16:9, no humans, no bodies, no text, no logos, no artificial narrative overlays.'}),
        signal:AbortSignal.timeout(25000)
      });
      const result=await response.json().catch(()=>({}));
      const requestId=result.request_id||null;
      const state=response.ok&&requestId?'submitted':response.ok?'outcome_unknown':'rejected';
      await store.setJSON(recordKey,{id:shot.id,state,request_id:requestId,http_status:response.status,description:shot.subject,updated_at:new Date().toISOString()});
      if(state!=='submitted'){console.warn('BTK v2 stops on non-accepted generation '+shot.id);break;}
      completedSubmissions++;
    }catch(err){
      await store.setJSON(recordKey,{id:shot.id,state:'outcome_unknown',updated_at:new Date().toISOString()});
      console.warn('BTK v2 stops on uncertain outcome '+shot.id);break;
    }
  }
  await store.setJSON('v2-status',{state:completedSubmissions===shots.length?'submitted':'needs_review',submitted:completedSubmissions,total:shots.length,planned_max_usd:maxPlanningUsd,updated_at:new Date().toISOString()});
}
export const config={schedule:'*/5 * * * *'};
