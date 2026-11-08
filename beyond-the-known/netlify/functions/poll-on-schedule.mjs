import {getStore} from '@netlify/blobs';
const API='https://api.higgsfield.ai';
const ids=['001','003','006'];
const terminal=new Set(['completed','failed','nsfw','canceled','submission_rejected','outcome_unknown']);
export default async function handler(){
 const key=Netlify.env.get('HF_KEY');if(!key)return;
 const store=getStore('btk-production-ep001');
 const run=await store.get('run',{type:'json'});
 if(!run || !['submitted','manual_review_required'].includes(run.state))return;
 await Promise.all(ids.map(async id=>{
  const path='jobs/EP001/'+id;let job=await store.get(path,{type:'json'});
  if(!job?.request_id || terminal.has(job.state))return;
  try {
   const r=await fetch(API+'/requests/'+encodeURIComponent(job.request_id)+'/status',{
      headers:{Authorization:'Key '+key,Accept:'application/json'},signal:AbortSignal.timeout(8000)});
   if(!r.ok)return;
   const data=await r.json();const state=data.status||data.request?.status||'processing';
   const out=data.result||data.output||data;
   const url=job.kind==='image'?out?.images?.[0]?.url:(out?.video?.url||(typeof out?.video==='string'?out.video:null));
   job={...job,state,updated_at:new Date().toISOString(),
      ...(state==='completed'&&typeof url==='string'&&url.startsWith('https://')?{result_url:url}:{})};
   await store.setJSON(path,job);
  }catch(e){console.warn('[BTK] Transient polling failure for shot '+id);}
 }));
}
export const config={schedule:'*/10 * * * *'};
