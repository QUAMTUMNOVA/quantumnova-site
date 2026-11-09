import {getStore} from '@netlify/blobs';
import {SHOTS} from '../../episodes/ep007/EP007-shot-queue-data.mjs';
// EP007: funded QNova developer-API, actual-audio-timed 60 original distinct plausible Centralia coalfield historical reenactment shots.
// Distinct from paid Higgsfield website credits. No public review/production endpoints.
// Guardrails: only begin after archived 3-shot API pilot, max 4 new shots/invocation,
// per-shot estimate<=US$0.23, combined estimated episode video quote cap US$13.00.
// Never retry an uncertain POST; never create repeated shot IDs; no public publication.
const MODEL='kling-video/v3.0/std/text-to-video';
const USD_CAP=13.00, PER_SHOT_CAP=0.23, PER_RUN=4;
const BAD=new Set(['blocked_no_credit','blocked_quote','preflight_failure','outcome_unknown','failed','nsfw','rejected','canceled']);
function input(shot){
 return {
  prompt:shot.prompt+' Original historically accurate Centralia Pennsylvania underground anthracite fire documentary reconstruction, no fantasy lava or ghosts, credible rural Appalachia historical environments, no movie imagery or copyrighted characters.',
  duration:5,aspect_ratio:'16:9',sound:'off',multi_shots:false,cfg_scale:0.5
 };
}
export default async function(){
 const key=Netlify.env.get('HF_KEY');if(!key)return;
 const store=getStore('btk-ep007-api');
 const control=await store.get('full_control',{type:'json'});
 if(control?.paused||control?.enabled===false)return;
 const all=await Promise.all(SHOTS.map(s=>store.get('shot/'+s.id,{type:'json'})));
 if(all.some(r=>r&&BAD.has(r.state))){console.warn('EP007 queue halted: a failed, unknown, or insufficient-funding job needs reconciliation');return}
 // First three are the strictly capped separate pilot. Do not generate the full movie
 // until those first 3 have finished and been copied into private storage.
 if(!all.slice(0,3).every(r=>r?.state==='completed'&&r?.stored_asset)){
  console.info('EP007 awaiting 3 archived pilot shots before full video generation');return;
 }
 let reserved=all.reduce((sum,row)=>sum+(Number(row?.quote_usd)||0),0);
 let n=0;
 for(let i=3;i<SHOTS.length&&n<PER_RUN;i++){
  const shot=SHOTS[i],path='shot/'+shot.id;
  if(all[i])continue;
  const body=input(shot);
  let cost;
  try{
   const res=await fetch('https://api.higgsfield.ai/estimate/'+MODEL,{
     method:'POST',headers:{Authorization:'Key '+key,'Content-Type':'application/json',Accept:'application/json'},
     body:JSON.stringify(body),signal:AbortSignal.timeout(16000)
   });
   const q=await res.json().catch(()=>({}));
   cost=Number(q.usd);
   if(!res.ok||!Number.isFinite(cost)||cost<=0||cost>PER_SHOT_CAP||reserved+cost>USD_CAP){
    await store.setJSON(path,{id:shot.id,chapter:shot.chapter,state:'blocked_quote',updated_at:new Date().toISOString(),http_status:res.status});
    console.warn('EP007 safe budget/quote blocked shot '+shot.id);break;
   }
  }catch{console.warn('EP007 quote unavailable; nothing submitted this run');break}
  const lock=await store.setJSON(path,{
    id:shot.id,chapter:shot.chapter,source_start_sec:shot.start,source_end_sec:shot.end,
    state:'submitting',model:MODEL,quote_usd:cost,updated_at:new Date().toISOString()
   },{onlyIfNew:true});
  if(!lock.modified)continue;
  reserved+=cost;
  try{
   const res=await fetch('https://api.higgsfield.ai/'+MODEL,{
     method:'POST',headers:{Authorization:'Key '+key,'Content-Type':'application/json',Accept:'application/json'},
     body:JSON.stringify(body),signal:AbortSignal.timeout(25000)
   });
   const data=await res.json().catch(()=>({}));
   const request_id=typeof data.request_id==='string'?data.request_id:null;
   const detail=JSON.stringify(data).slice(0,150).toLowerCase();
   const state=res.ok&&request_id?'submitted':res.status===402||detail.includes('insufficient')?'blocked_no_credit':res.ok?'outcome_unknown':'rejected';
   await store.setJSON(path,{
     id:shot.id,chapter:shot.chapter,source_start_sec:shot.start,source_end_sec:shot.end,
     state,request_id,model:MODEL,quote_usd:cost,http_status:res.status,
     updated_at:new Date().toISOString()
   });
   if(state!=='submitted')break;
   n++;
  }catch{
   await store.setJSON(path,{id:shot.id,chapter:shot.chapter,state:'outcome_unknown',quote_usd:cost,updated_at:new Date().toISOString()});
   break;
  }
 }
 await store.setJSON('full_status',{episode:'EP007',target:SHOTS.length,quoted_reserved_usd:reserved,
   estimated_max_usd:USD_CAP,submitted_this_run:n,public_release:false,
   updated_at:new Date().toISOString()});
 console.info('EP007 queued '+n+' original shots; total reserved USD '+reserved.toFixed(2));
}
export const config={schedule:'* * * * *'};
