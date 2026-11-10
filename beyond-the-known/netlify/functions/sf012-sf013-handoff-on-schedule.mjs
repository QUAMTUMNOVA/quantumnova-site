import {getStore} from '@netlify/blobs';
import {SHOTS as A} from '../../shorts/scenario-files/sf012/SF012-shot-queue-data.mjs';
import {SHOTS as B} from '../../shorts/scenario-files/sf013/SF013-shot-queue-data.mjs';
// One-time PRIVATE source-asset handoff. Never exposes Netlify credentials or
// original private Blob bytes. Uploads only previously archived sources to
// owner-connected Higgsfield storage; no image/video generation or billing.
const all=[...A.map(shot=>({shot,project:'sf012'})),...B.map(shot=>({shot,project:'sf013'}))];
const state=()=>getStore('btk-qnova-sf012-sf013-handoff');
async function upload(item){
 const {shot,project}=item, target=state(),key='asset/'+shot.id;
 const prior=await target.get(key,{type:'json'});
 if(prior?.status==='complete'&&prior?.url)return prior;
 const job=await getStore('btk-'+project+'-api').get('shot/'+shot.id,{type:'json'});
 if(!(job?.state==='completed' && job.stored_asset))return null;
 const buf=await getStore('btk-'+project+'-videos').get(job.stored_asset,{type:'arrayBuffer'});
 if(!buf||buf.byteLength<100000||buf.byteLength>45000000)return null;
 const secret=Netlify.env.get('HF_KEY');if(!secret)throw new Error('Missing key');
 const p=await fetch('https://api.higgsfield.ai/files/generate-upload-url',{method:'POST',
   headers:{Authorization:'Key '+secret,'Content-Type':'application/json',Accept:'application/json'},
   body:JSON.stringify({content_type:'video/mp4'}),signal:AbortSignal.timeout(18000)});
 const q=await p.json().catch(()=>({}));
 if(!p.ok||!q.upload_url||!q.public_url)throw new Error('Failed upload URL '+p.status);
 const u=new URL(q.upload_url);
 if(u.protocol!=='https:')throw new Error('Insecure upload URL');
 const headers={...(q.upload_headers||{})};
 if(!Object.keys(headers).some(h=>h.toLowerCase()==='content-type'))headers['Content-Type']='video/mp4';
 const saved=await fetch(q.upload_url,{method:'PUT',headers,body:buf,signal:AbortSignal.timeout(110000)});
 if(!saved.ok)throw new Error('Storage PUT '+saved.status);
 const row={status:'complete',id:shot.id,project,url:q.public_url,size:buf.byteLength,finished_at:new Date().toISOString()};
 await target.setJSON(key,row);
 return row;
}
export default async function(){
 const store=state();
 const rows=await Promise.all(all.map(x=>store.get('asset/'+x.shot.id,{type:'json'})));
 const first=all.map((item,i)=>({item,row:rows[i]})).filter(x=>!x.row?.url).slice(0,4);
 if(!first.length)return;
 const events=await Promise.allSettled(first.map(x=>upload(x.item)));
 await store.setJSON('progress',{target:all.length,completed:rows.filter(x=>x?.url).length+events.filter(x=>x.status==='fulfilled'&&x.value?.url).length,checked_this_run:first.length,failures:events.filter(x=>x.status==='rejected').length,last_error:events.find(x=>x.status==='rejected')?.reason?.message||null,updated_at:new Date().toISOString()});
}
export const config={schedule:'* * * * *'};
