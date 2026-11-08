import {getStore} from '@netlify/blobs';
// EP001 V3 second curated API video tranche, 12 x Wan 3.0 720p 5 seconds.
// Conservative estimated planning amount <= US$18, subject to provider billing.
// Halt on failed or uncertain submission, never retry automatically.
// Paid plugin credits are NOT used.
const shots=[{"id":"213","chapter":"animals","narration":"Millions of pets would be trapped inside homes","description":"An orange tabby cat sits at a closed apartment door with empty food bowl, softly paws at door, pauses and turns to silent hallway; natural cat motion and scale."},{"id":"214","chapter":"animals","narration":"A hardy grazing animal with access to water might survive","description":"Small herd of cattle grazes beside a spring-fed pond on an abandoned farm, overcast natural daylight, quiet wind in grasses, no people, no implausible animal behaviour."},{"id":"215","chapter":"animals","narration":"An animal confined in a barn could be in serious trouble","description":"Deserted livestock barn with cattle behind open timber gate, unattended automatic feeding trough nearly empty, believable animals watching empty aisle; no suffering closeups."},{"id":"216","chapter":"animals","narration":"Some species might benefit from quieter roads","description":"Red fox cautiously crosses an empty suburban road at blue hour, deer silhouette far down street, handheld natural-history tracking, believable wildlife gait."},{"id":"217","chapter":"first_year","narration":"In cold climates, freezing and thawing widen cracks","description":"Close realistic macro shot of weathered concrete bridge joint under thawing frost and trickling ice melt, existing hairline cracks, physically plausible surface wear, camera sliding along structure."},{"id":"218","chapter":"first_year","narration":"Timber decays where moisture persists","description":"Slow track over dark damp timber floorboards next to an abandoned window with peeling paint, drops collecting on rotted wood, fungi at edge, believable one-year water damage."},{"id":"219","chapter":"first_year","narration":"Plants take root in gutters walls and abandoned lots","description":"Close-up of neglected roof gutter packed with damp leaves and self-seeded grass, rainwater spilling past blocked downpipe, camera tilts toward intact abandoned house."},{"id":"220","chapter":"first_year","narration":"Roads begin to change as drainage systems clog","description":"Ground-level documentary image of blocked storm drain on abandoned suburban road, leaves and twigs collected, rainwater backs up, low moving camera reveals young root under cracked asphalt."},{"id":"221","chapter":"ten_years","narration":"Grasses become shrubs, shrubs become young trees","description":"One continuous photorealistic observational drone shot through decade-abandoned urban parking lot with knee-high grass, shrub growth and scattered saplings, mature intact buildings around it."},{"id":"222","chapter":"ten_years","narration":"Elsewhere in deserts vegetation barely advances","description":"Arid desert roadside town abandoned for ten years with dusty empty street, rusting signs, sparse weeds only, wind moves dry sand naturally, slow stable camera."},{"id":"223","chapter":"hundred_years","narration":"Bridges deteriorate as corrosion and vegetation attack","description":"Natural science documentary tracking across century-old steel bridge rivets and partly corroded girder above river; vines at deck edge, physically believable age, no cinematic collapse."},{"id":"224","chapter":"thousand_years","narration":"Human traces would survive in sediments plastics ceramics glass","description":"Macro archaeological documentary camera pans over ancient sediment layers where faded plastic fragments, ceramics, metal alloys and gravel are embedded, natural soil textures, no labels."}];
const storeName='btk-ep001-v3';
export default async function(){
 const key=Netlify.env.get('HF_KEY');
 if(!key)return;
 const store=getStore(storeName);
 let attempted=0;
 for(const shot of shots){
   if(attempted>=2)break;
   const path='shot/'+shot.id;
   const claim=await store.setJSON(path,{id:shot.id,state:'submitting',narration:shot.narration,updated_at:new Date().toISOString()},{onlyIfNew:true});
   if(!claim.modified){
     const old=await store.get(path,{type:'json'});
     if(['outcome_unknown','rejected','failed'].includes(old?.state)){console.warn('V3 next tranche stops at unresolved job '+shot.id);break}
     continue;
   }
   try{
     const result=await fetch('https://api.higgsfield.ai/alibaba/wan-3.0/text-to-video',{
      method:'POST',headers:{Authorization:'Key '+key,Accept:'application/json','Content-Type':'application/json'},
      body:JSON.stringify({duration:5,resolution:'720p',aspect_ratio:'16:9',generate_audio:false,
      prompt:'Premium realistic natural-history documentary. One continuous five-second widescreen 16:9 moving shot, 35mm observational cinema style, physically accurate actions, restraint, plausible camera motion and natural lighting. '+shot.description+' No people, no bodies, no subtitles, no logos, no impossible transformations.'}),
      signal:AbortSignal.timeout(25000)
     });
     const payload=await result.json().catch(()=>({}));
     const request_id=payload.request_id||null;
     const state=result.ok&&request_id?'submitted':result.ok?'outcome_unknown':'rejected';
     await store.setJSON(path,{id:shot.id,chapter:shot.chapter,narration:shot.narration,
       state,request_id,http_status:result.status,estimated_max_usd:1.5,updated_at:new Date().toISOString()});
     if(state!=='submitted')break;
     attempted++;
   }catch(e){
    await store.setJSON(path,{id:shot.id,chapter:shot.chapter,narration:shot.narration,state:'outcome_unknown',updated_at:new Date().toISOString()});
    break;
   }
 }
 const rows=await Promise.all(shots.map(s=>store.get('shot/'+s.id,{type:'json'})));
 const count=rows.filter(r=>r?.request_id).length;
 const uncertain=rows.some(r=>['rejected','outcome_unknown','failed'].includes(r?.state));
 await store.setJSON('second-batch-status',{status:uncertain?'needs_review':count===shots.length?'all_submitted':'submitting',
     submitted:count,planned:shots.length,estimated_max_usd:18,updated_at:new Date().toISOString()});
}
export const config={schedule:'*/2 * * * *'};
