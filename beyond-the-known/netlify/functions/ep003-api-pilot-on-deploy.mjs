import {getStore} from '@netlify/blobs';
import {SHOTS} from '../../episodes/ep003/EP003-shot-queue-data.mjs';
// EP003 funded developer-API pilot. One-time locked three distinct original shots.
// Maximum quoted/accepted planned spend US$0.75. Not a provider wallet balance.
// No publication; private assets only. No retry on ambiguous API submissions.
const SITE='a31be4b6-9c59-47d9-b387-3cf0ab9a72b1';
const MODEL='kling-video/v3.0/std/text-to-video';
const LIMIT=0.75;
const PICK=SHOTS.slice(0,3);
function body(shot){return {prompt:shot.prompt+' Realistic scene continuity and period-accurate material details. Absolutely no completed Hadrianic Pantheon facade, no Caracalla baths, no printed words or watermarks.',duration:5,aspect_ratio:'16:9',sound:'off',multi_shots:false,cfg_scale:0.5}}
async function dispatch(){
 const key=Netlify.env.get('HF_KEY');if(!key){console.warn('EP003 API key absent');return}
 const store=getStore('btk-ep003-api');
 const lock=await store.setJSON('pilot_lock',{state:'started',max_estimate_usd:LIMIT,started_at:new Date().toISOString(),publication:false},{onlyIfNew:true});
 if(!lock.modified){console.info('EP003 pilot already attempted; no duplicate charges');return}
 let spent=0,accepted=0;
 for(const shot of PICK){
  const jobKey='shot/'+shot.id;
  const input=body(shot);
  try{
   const r=await fetch('https://api.higgsfield.ai/estimate/'+MODEL,{
    method:'POST',headers:{Authorization:'Key '+key,'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify(input),signal:AbortSignal.timeout(16000)});
   const j=await r.json().catch(()=>({}));
   const cost=Number(j.usd);
   if(!r.ok||!Number.isFinite(cost)||cost<=0||cost>0.25||spent+cost>LIMIT){
    await store.setJSON(jobKey,{id:shot.id,state:'blocked_quote',http_status:r.status,updated_at:new Date().toISOString()});
    break;
   }
   // First persist 'submitting'. If the remote request times out, never retry.
   const reserve=await store.setJSON(jobKey,{id:shot.id,chapter:shot.chapter,state:'submitting',model:MODEL,quote_usd:cost,updated_at:new Date().toISOString()},{onlyIfNew:true});
   if(!reserve.modified){console.warn('EP003 duplicate reservation: '+shot.id);break}
   spent+=cost;
   try{
    const res=await fetch('https://api.higgsfield.ai/'+MODEL,{
      method:'POST',headers:{Authorization:'Key '+key,'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify(input),signal:AbortSignal.timeout(25000)});
    const result=await res.json().catch(()=>({}));
    const request_id=typeof result.request_id==='string'?result.request_id:null;
    const note=JSON.stringify(result).slice(0,160).toLowerCase();
    const state=res.ok&&request_id?'submitted':res.status===402||note.includes('insufficient')?'blocked_no_credit':res.ok?'outcome_unknown':'rejected';
    await store.setJSON(jobKey,{id:shot.id,chapter:shot.chapter,model:MODEL,state,request_id,quote_usd:cost,http_status:res.status,updated_at:new Date().toISOString()});
    if(state!=='submitted')break;
    accepted++;
   }catch{
    await store.setJSON(jobKey,{id:shot.id,chapter:shot.chapter,state:'outcome_unknown',quote_usd:cost,updated_at:new Date().toISOString()});
    break;
   }
  }catch{
   await store.setJSON(jobKey,{id:shot.id,state:'preflight_failure',updated_at:new Date().toISOString()});
   break;
  }
 }
 await store.setJSON('pilot_status',{accepted,requested:PICK.length,max_estimate_usd:LIMIT,submitted_estimate_usd:spent,publication:false,updated_at:new Date().toISOString()});
 console.info('EP003 pilot accepted '+accepted+'/'+PICK.length+' at quoted USD '+spent.toFixed(2));
}
export default {
 async deploySucceeded(event){
  if(event?.site?.id!==SITE)return;
  if(event?.deploy?.context&&event.deploy.context!=='production')return;
  await dispatch();
 }
};
