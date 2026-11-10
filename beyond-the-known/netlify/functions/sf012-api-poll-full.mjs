import {getStore} from '@netlify/blobs';
import {SHOTS} from '../../shorts/scenario-files/sf012/SF012-shot-queue-data.mjs';
// Read-only Higgsfield API polling + PRIVATE long-term archival. No generation or publish.
const MAX_CHECK=12,MAX_SAVE=5;
export default async function(){
 const key=Netlify.env.get('HF_KEY');if(!key)return;
 const jobs=getStore('btk-sf012-api'), media=getStore('btk-sf012-videos');
 const rows=await Promise.all(SHOTS.map(s=>jobs.get('shot/'+s.id,{type:'json'})));
 const pending=rows.map((row,i)=>({row,shot:SHOTS[i]}))
   .filter(x=>x.row?.request_id&&!['completed','failed','nsfw','canceled','rejected','outcome_unknown'].includes(x.row.state))
   .slice(0,MAX_CHECK);
 await Promise.all(pending.map(async({row,shot})=>{
  try{
   const response=await fetch('https://api.higgsfield.ai/requests/'+encodeURIComponent(row.request_id)+'/status',{
    headers:{Authorization:'Key '+key,Accept:'application/json'},signal:AbortSignal.timeout(12000)});
   if(!response.ok)return;
   const j=await response.json();
   const state=j.status||j.request?.status||'processing';
   const o=j.result||j.output||j;
   const candidate=o?.video?.url||(typeof o?.video==='string'?o.video:null);
   const next={...row,state,updated_at:new Date().toISOString()};
   if(state==='completed'&&typeof candidate==='string'&&candidate.startsWith('https://'))next.result_url=candidate;
   await jobs.setJSON('shot/'+shot.id,next);
  }catch{console.warn('SF012 polling deferred for '+shot.id)}
 }));
 const newer=await Promise.all(SHOTS.map(s=>jobs.get('shot/'+s.id,{type:'json'})));
 const ready=newer.map((row,i)=>({row,shot:SHOTS[i]}))
   .filter(x=>x.row?.state==='completed'&&x.row.result_url&&!x.row.stored_asset)
   .slice(0,MAX_SAVE);
 await Promise.all(ready.map(async({row,shot})=>{
  try{
   const dest='original/'+shot.id+'.mp4';
   const exists=await media.getMetadata(dest);
   if(!exists){
    const u=new URL(row.result_url);
    if(u.protocol!=='https:'||!u.hostname.endsWith('.cloudfront.net'))return;
    const response=await fetch(u.toString(),{signal:AbortSignal.timeout(23000)});
    if(!response.ok||Number(response.headers.get('content-length')||0)>50000000)return;
    const blob=await response.blob();
    if(blob.size<5000||blob.size>50000000)return;
    await media.set(dest,blob,{metadata:{
       episode:'SF012',id:shot.id,chapter:String(shot.chapter),
       start_sec:String(shot.start),end_sec:String(shot.end),kind:'video',access:'private'
    }});
   }
   await jobs.setJSON('shot/'+shot.id,{...row,stored_asset:dest,updated_at:new Date().toISOString()});
  }catch{console.warn('SF012 archive deferred for '+shot.id)}
 }));
 const fresh=await Promise.all(SHOTS.map(s=>jobs.get('shot/'+s.id,{type:'json'})));
 const counts=fresh.reduce((a,row)=>(a[row?.state||'planned']=(a[row?.state||'planned']||0)+1,a),{});
 await jobs.setJSON('full_progress',{target:SHOTS.length,counts,
   archived:fresh.filter(row=>row?.stored_asset).length,
   reserved_usd:fresh.reduce((a,row)=>a+(Number(row?.quote_usd)||0),0),
   private_upload:false,public_release:false,updated_at:new Date().toISOString()});
 console.info('SF012 video status poll='+pending.length+' archived='+ready.length);
}
export const config={schedule:'* * * * *'};
