import {getStore} from '@netlify/blobs';
// BTK EP001 V3 / original narration-led cinematic video batch, QNova funded developer API ONLY.
// $1.50 per 5-second WAN 3.0 video planning limit; 12 originals: US$18 total conservative estimate.
// Schedule submits at most 2 each run; once-only store reservation prevents duplicated charges.
// Provider billing is authoritative; this is an internal spend-planning cap, not an external billing limit.
const STORE='btk-ep001-v3';
const TASKS=[{"beat":"B002","id":"201","subject":"From a fixed low camera on kitchen floor, a white ceramic mug falls from a suddenly abandoned human-height position, hits tile and shatters. No hands or people are visible. The scene is fully normal rather than post-apocalyptic. Real-time physically correct ceramic impact, shards, coffee spill. Intimate first four seconds of a catastrophe.","kind":"video"},{"beat":"B005","id":"202","subject":"Low tracking shot at a junction as a driverless black sedan creeps across marked lanes, then bumps another empty vehicle; physically plausible tires and speed and scale. Daylight, no explosions, no visible people. Follow action and resulting stillness in one continuous shot.","kind":"video"},{"beat":"B008","id":"203","subject":"Empty airliner cockpit in flight, pilot seats abandoned, autopilot flight director display active, engine and navigation controls physically plausible, white clouds slowly moving through front windows. Intimate slow dolly toward instrument panel. No people.","kind":"video"},{"beat":"B015","id":"204","subject":"Motorway traffic immediately after humanity vanishes, a delivery truck without driver coasts at a realistic speed and swerves gently until resting against safety barrier. A few cars stationary. No bodies or carnage, road markings consistent. Tracking roadside documentary camera.","kind":"video"},{"beat":"B019","id":"205","subject":"Wide shot from automated railway platform: empty commuter train enters slowly and the safety braking brings it to a full stop. No passengers, drivers or people. Realistic train wheels and station geometry, clear arrival and braking progression, overcast.","kind":"video"},{"beat":"B026","id":"206","subject":"High-angle documentary shot over power distribution substation with transformers and high-voltage switchgear. In sequence, protection relays trigger small indicator flashes then several neighbourhood lights go dark in distance. No dramatic lightning or impossible sparking. Twilight.","kind":"video"},{"beat":"B028","id":"207","subject":"Empty hospital emergency ward corridor: power cuts out on ceiling fluorescent strips, seconds later backup generator power restores subdued emergency lighting, medical monitors still glow. Smooth track with physically realistic lighting sequence, no patients or people.","kind":"video"},{"beat":"B031","id":"208","subject":"Inside a server room after blackout, rack fans audibly but invisibly spin down, LED indicators go out rack by rack as backup supply fails, cooling lights darken. Controlled cinematic continuous sideways slide past equipment, no people, no writing.","kind":"video"},{"beat":"B042","id":"209","subject":"From a quiet suburban bathroom, a running tap slows to intermittent drips as municipal pressure fails, empty mirror and natural afternoon lighting. Focus pull from water stream to empty doorway, seamless documentary 5-second action.","kind":"video"},{"beat":"B051","id":"210","subject":"A domestic dog scratches at the interior back door of an empty modern house, pauses, then walks to an empty feeding bowl; emotionally restrained documentary scene, correct dog anatomy and natural motion, no people.","kind":"video"},{"beat":"B061","id":"211","subject":"In an abandoned house a year after people vanish, rainwater steadily drips through failed roof flashing onto timber floor, water stains spread from ceiling in a realistic static close tracking shot, no fantastical instant decay, dark overcast sky.","kind":"video"},{"beat":"B091","id":"212","subject":"A century after humans vanish, slow descending drone shot over a once-urban residential block, rows of concrete foundations partly visible under thick mixed temperate forest, realistic ecological regrowth, consistent building scale, soft morning haze.","kind":"video"}];
const plannedMaxUsd=18;
export default async function(){
 const apiKey=Netlify.env.get('HF_KEY');
 if(!apiKey){console.warn('BTK V3 HF_KEY missing');return}
 const store=getStore(STORE);
 await store.setJSON('run-settings',{episode:'EP001',planned_max_usd:plannedMaxUsd,planned_shots:TASKS.length,source:'QNova_API',youtube_publication_enabled:false},{onlyIfNew:true});
 let sent=0;
 for(const shot of TASKS){
  if(sent>=2)break;
  const key='shot/'+shot.id;
  const reserved=await store.setJSON(key,{id:shot.id,beat:shot.beat,state:'submitting',updated_at:new Date().toISOString()},{onlyIfNew:true});
  if(!reserved.modified){
   const old=await store.get(key,{type:'json'});
   if(!old || ['outcome_unknown','rejected','failed'].includes(old.state)){
    console.warn('V3 encountered uncertain/failed request, stop safely at '+shot.id);break;
   }
   continue;
  }
  try{
   const res=await fetch('https://api.higgsfield.ai/alibaba/wan-3.0/text-to-video',{
    method:'POST',headers:{Authorization:'Key '+apiKey,'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify({duration:5,resolution:'720p',aspect_ratio:'16:9',generate_audio:false,prompt:'Premium photorealistic natural-history documentary, strict real-world physics and architectural credibility, natural cinematic lighting, coherent stable camera movement. One continuous five-second widescreen shot. '+shot.subject+' No captions or logos, no visibly present humans, no stylised action, no cartoon visuals.'}),
    signal:AbortSignal.timeout(26000)
   });
   const payload=await res.json().catch(()=>({}));
   const request_id=payload.request_id||null;
   const state=res.ok&&request_id?'submitted':res.ok?'outcome_unknown':'rejected';
   await store.setJSON(key,{id:shot.id,beat:shot.beat,state,request_id,http_status:res.status,
     subject:shot.subject,estimated_max_usd:1.5,updated_at:new Date().toISOString()});
   if(state!=='submitted'){console.warn('V3 stopped on non-confirmed submission '+shot.id);break}
   sent++;
  }catch(e){
   await store.setJSON(key,{id:shot.id,beat:shot.beat,state:'outcome_unknown',updated_at:new Date().toISOString()});
   console.warn('V3 stopped on uncertain transport outcome '+shot.id);break;
  }
 }
 const rows=await Promise.all(TASKS.map(shot=>store.get('shot/'+shot.id,{type:'json'})));
 const total=rows.filter(r=>r?.request_id).length;
 const unresolved=rows.some(r=>['rejected','outcome_unknown','failed'].includes(r?.state));
 await store.setJSON('status',{state:unresolved?'needs_review':total===TASKS.length?'submitted':'submitting',
  submitted:total,total:TASKS.length,planned_max_usd:plannedMaxUsd,updated_at:new Date().toISOString()});
 console.info('BTK V3 job batch '+sent+' added, '+total+'/'+TASKS.length+' accepted');
}
export const config={schedule:'*/2 * * * *'};
