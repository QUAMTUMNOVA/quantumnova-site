import {getStore} from '@netlify/blobs';
const ids=['110','111','112','113','114','115'];
export default async function(){
 const hfKey=Netlify.env.get('HF_KEY'); if(!hfKey)return;
 const store=getStore('btk-production-ep001-v2');
 let updated=0;
 for(const id of ids){
  const key='jobs/'+id,old=await store.get(key,{type:'json'});
  if(!old?.request_id || ['completed','failed','canceled','rejected','outcome_unknown'].includes(old.state))continue;
  try{
   const r=await fetch('https://api.higgsfield.ai/requests/'+encodeURIComponent(old.request_id)+'/status',
    {headers:{Authorization:'Key '+hfKey,Accept:'application/json'},signal:AbortSignal.timeout(10000)});
   if(!r.ok)continue;
   const j=await r.json();
   const state=j.status||j.request?.status||'processing';
   const item=j.result||j.output||j;
   const result_url=item.video?.url||(typeof item.video==='string'?item.video:null);
   const entry={...old,state,updated_at:new Date().toISOString()};
   if(state==='completed'&&result_url?.startsWith('https://'))entry.result_url=result_url;
   await store.setJSON(key,entry);updated++;
  }catch(e){console.warn('v2 poll delayed '+id);}
 }
 console.log('V2 poll updated '+updated);
}
export const config={schedule:'*/3 * * * *'};
