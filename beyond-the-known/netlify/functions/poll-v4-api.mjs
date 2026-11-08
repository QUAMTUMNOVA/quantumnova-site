import {getStore} from '@netlify/blobs';
const IDS=Array.from({length:46},(_,i)=>String(301+i));
export default async function(){
 const key=Netlify.env.get('HF_KEY');if(!key)return;
 const store=getStore('btk-ep001-v4');
 let n=0;
 for(const id of IDS){
  if(n>=20)break;
  const path='shot/'+id;
  const old=await store.get(path,{type:'json'});
  if(!old?.request_id||['completed','failed','canceled','rejected','outcome_unknown'].includes(old.state))continue;
  try{
   const res=await fetch('https://api.higgsfield.ai/requests/'+encodeURIComponent(old.request_id)+'/status',
    {headers:{Authorization:'Key '+key,Accept:'application/json'},signal:AbortSignal.timeout(10000)});
   if(!res.ok)continue;
   const j=await res.json();
   const state=j.status||j.request?.status||'processing';
   const result=j.result||j.output||j;
   const candidate=result?.video?.url||(typeof result?.video==='string'?result.video:null);
   const next={...old,state,updated_at:new Date().toISOString()};
   if(state==='completed'&&typeof candidate==='string'&&candidate.startsWith('https://'))next.result_url=candidate;
   await store.setJSON(path,next);n++;
  }catch(e){console.warn('V4 poll delayed for '+id)}
 }
 const all=await Promise.all(IDS.map(id=>store.get('shot/'+id,{type:'json'})));
 const counts=all.reduce((x,r)=>{const s=r?.state||'planned';x[s]=(x[s]||0)+1;return x},{});
 await store.setJSON('status',{counts,updated_at:new Date().toISOString(),target:46,estimated_planned_usd:69});
}
export const config={schedule:'* * * * *'};
