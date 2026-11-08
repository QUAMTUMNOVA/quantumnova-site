import {getStore} from '@netlify/blobs';
const ids=Array.from({length:28},(_,i)=>String(201+i));
export default async function(){
 const key=Netlify.env.get('HF_KEY'); if(!key)return;
 const store=getStore('btk-ep001-v3');
 let updated=0;
 for(const id of ids){
  const k='shot/'+id,old=await store.get(k,{type:'json'});
  if(!old?.request_id||['completed','failed','canceled','rejected','outcome_unknown'].includes(old.state))continue;
  try{
   const res=await fetch('https://api.higgsfield.ai/requests/'+encodeURIComponent(old.request_id)+'/status',{
      headers:{Authorization:'Key '+key,Accept:'application/json'},signal:AbortSignal.timeout(9500)});
   if(!res.ok)continue;
   const payload=await res.json();
   const state=payload.status||payload.request?.status||'processing';
   const result=payload.result||payload.output||payload;
   const candidate=result?.video?.url||(typeof result?.video==='string'?result.video:null);
   const next={...old,state,updated_at:new Date().toISOString()};
   if(state==='completed' && typeof candidate==='string'&&candidate.startsWith('https://'))next.result_url=candidate;
   await store.setJSON(k,next);updated++;
  }catch(e){console.warn('V3 status check deferred '+id)}
 }
 console.info('V3 status updates '+updated);
}
export const config={schedule:'1,6,11,16,21,26,31,36,41,46,51,56 * * * *'};
