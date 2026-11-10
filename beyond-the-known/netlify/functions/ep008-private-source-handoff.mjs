import {getStore} from '@netlify/blobs';
import {SHOTS} from '../../episodes/ep008/EP008-shot-queue-data.mjs';
// TEMPORARY: After ALL 60 existing EP008 source videos are archived,
// copy each privately from Netlify Blobs to user-owned Higgsfield media
// storage. No video generation, no API cost, no disclosure of the API key.
// Delete this endpoint immediately following successful editor transfer.
const SITE='a31be4b6-9c59-47d9-b387-3cf0ab9a72b1';
const state=()=>getStore('btk-ep008-private-handoff');
async function copyOne(shot){
 const dest=state(),key='transfer/'+shot.id;
 const prev=await dest.get(key,{type:'json'});
 if(prev?.status==='complete'&&prev?.public_url)return prev;
 const job=await getStore('btk-ep008-api').get('shot/'+shot.id,{type:'json'});
 if(job?.state!=='completed'||!job.stored_asset)throw new Error('Archival not ready: '+shot.id);
 const buf=await getStore('btk-ep008-videos').get(job.stored_asset,{type:'arrayBuffer'});
 if(!buf || buf.byteLength<5000 || buf.byteLength>50000000)throw new Error('Missing/bad source: '+shot.id);
 const keySecret=Netlify.env.get('HF_KEY');
 if(!keySecret)throw new Error('HF_KEY not configured');
 const p=await fetch('https://api.higgsfield.ai/files/generate-upload-url',{method:'POST',
   headers:{Authorization:'Key '+keySecret,'Content-Type':'application/json',Accept:'application/json'},
   body:JSON.stringify({content_type:'video/mp4'}),signal:AbortSignal.timeout(18000)});
 const q=await p.json().catch(()=>({}));
 if(!p.ok||!q.upload_url||!q.public_url)throw new Error('Upload URL request failed '+p.status);
 const u=new URL(q.upload_url);if(u.protocol!=='https:')throw new Error('Not HTTPS');
 const hs={...(q.upload_headers||{})};
 if(!Object.keys(hs).some(x=>x.toLowerCase()==='content-type'))hs['Content-Type']='video/mp4';
 const res=await fetch(q.upload_url,{method:'PUT',headers:hs,body:buf,signal:AbortSignal.timeout(110000)});
 if(!res.ok)throw new Error('PUT failed '+res.status);
 const result={status:'complete',id:shot.id,chapter:shot.chapter,public_url:q.public_url,
   size_bytes:buf.byteLength,finished_at:new Date().toISOString()};
 await dest.setJSON(key,result);
 return result;
}
export default {
 async deploySucceeded(event){
  if(event?.site?.id!==SITE)return;
  if(event?.deploy?.context && event.deploy.context!=='production')return;
  const st=state(),rows=await Promise.all(SHOTS.map(s=>getStore('btk-ep008-api').get('shot/'+s.id,{type:'json'})));
  if(!rows.every(x=>x?.state==='completed'&&x?.stored_asset)){
   await st.setJSON('transfer_state',{status:'sources_not_all_ready',count:rows.filter(x=>x?.stored_asset).length,updated_at:new Date().toISOString()});
   return;
  }
  const done=await st.get('transfer_state',{type:'json'});
  if(done?.status==='complete')return;
  let copied=0,failed=0;const errors=[];
  for(let i=0;i<SHOTS.length;i+=6){
   const batch=SHOTS.slice(i,i+6);
   const result=await Promise.allSettled(batch.map(copyOne));
   for(let j=0;j<result.length;j++){
    if(result[j].status==='fulfilled')copied++;
    else{failed++;if(errors.length<8)errors.push({id:batch[j].id,error:String(result[j].reason?.message||result[j].reason).slice(0,160)});}
   }
   await st.setJSON('transfer_state',{status:'in_progress',copied,failed,target:SHOTS.length,errors,updated_at:new Date().toISOString()});
  }
  await st.setJSON('transfer_state',{status:failed===0?'complete':'partial',copied,failed,target:SHOTS.length,errors,updated_at:new Date().toISOString()});
 },
 async fetch(req){
  if(req.method!=='GET')return new Response('Method not allowed',{status:405});
  const st=state(),rows=await Promise.all(SHOTS.map(s=>st.get('transfer/'+s.id,{type:'json'})));
  return Response.json({episode:'EP008',target:SHOTS.length,copied:rows.filter(x=>x?.public_url).length,
    status:await st.get('transfer_state',{type:'json'}),
    assets:SHOTS.map((s,i)=>({id:s.id,chapter:s.chapter,url:rows[i]?.public_url||null,size_bytes:rows[i]?.size_bytes||null}))},
   {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','Referrer-Policy':'no-referrer'}});
 }
};
