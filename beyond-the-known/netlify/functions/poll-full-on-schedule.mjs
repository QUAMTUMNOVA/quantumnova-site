import {getStore} from '@netlify/blobs';
const ids=["002","004","005","007","009","010","012","013","014","015","017","019","020","023","026","027","008","011","016","018","021","022","024","025","028","029","030","031","032","033","034"];
const storeName='btk-production-ep001';
export default async function(){
 const secret=Netlify.env.get('HF_KEY');
 if(!secret)return;
 const store=getStore(storeName);
 const state=await store.get('full-production-status',{type:'json'});
 if(!state)return;
 let inspected=0,updated=0;
 // Limit to 8 concurrent HTTP checks and only jobs that are nonterminal.
 for(let i=0;i<ids.length;i+=8){
   await Promise.all(ids.slice(i,i+8).map(async id=>{
     const key='full/jobs/'+id, job=await store.get(key,{type:'json'});
     if(!job?.request_id||['completed','failed','canceled','nsfw','rejected','outcome_unknown'].includes(job.state))return;
     inspected++;
     try{
       const res=await fetch('https://api.higgsfield.ai/requests/'+encodeURIComponent(job.request_id)+'/status',{
         headers:{Authorization:'Key '+secret,Accept:'application/json'},signal:AbortSignal.timeout(9000)});
       if(!res.ok)return;
       const payload=await res.json();const status=payload.status||payload.request?.status||'processing';
       const result=payload.result||payload.output||payload;
       const assetUrl=job.kind==='image'?(result?.images?.[0]?.url||(typeof result?.image?.url==='string'?result.image.url:null)):
         (result?.video?.url||(typeof result?.video==='string'?result.video:null));
       const record={...job,state:status,updated_at:new Date().toISOString()};
       if(status==='completed'&&typeof assetUrl==='string'&&assetUrl.startsWith('https://'))record.result_url=assetUrl;
       await store.setJSON(key,record);updated++;
     }catch(e){console.warn('Transient full poll error for '+id);}
   }));
 }
 console.info('[BTK] full-generation poll checked='+inspected+' updated='+updated);
}
export const config={schedule:'3,13,23,33,43,53 * * * *'};
