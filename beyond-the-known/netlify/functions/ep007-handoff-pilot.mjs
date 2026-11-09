import {getStore} from '@netlify/blobs';
import {SHOTS} from '../../episodes/ep007/EP007-shot-queue-data.mjs';

// One-time owner-authorized private-media handoff. Existing original shots are copied
// directly FROM Netlify private Blobs TO a temporary Higgsfield API media upload.
// No source bytes, API key or signed upload URL are returned to the browser.
// Controlled pilot: first one shot only, full copy after pilot validation.
const target=SHOTS;
const SHOT_STORE='btk-ep007-videos',TRANSFER='btk-ep007-handoff';
async function processOne(shot){
  const dest=getStore(TRANSFER);
  const k='transfer/'+shot.id;
  const prev=await dest.get(k,{type:'json'});
  if(prev?.status==='uploaded'&&prev?.public_url)return prev;
  const apiKey=Netlify.env.get('HF_KEY');
  if(!apiKey)throw new Error('Missing API key in server-only Netlify environment');
  const bytes=await getStore(SHOT_STORE).get('original/'+shot.id+'.mp4',{type:'arrayBuffer'});
  if(!bytes || bytes.byteLength < 5000 || bytes.byteLength > 50_000_000)throw new Error('Missing or unexpectedly sized original footage for '+shot.id);
  const p=await fetch('https://api.higgsfield.ai/files/generate-upload-url',{
    method:'POST',
    headers:{Authorization:'Key '+apiKey,'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify({content_type:'video/mp4'}),
    signal:AbortSignal.timeout(18000)
  });
  const q=await p.json().catch(()=>({}));
  if(!p.ok || !q.upload_url || !q.public_url)throw new Error('Higgsfield media-upload preflight returned HTTP '+p.status+'; keys '+Object.keys(q).join(','));
  const u=new URL(q.upload_url);
  if(u.protocol!=='https:')throw new Error('Refuse non-HTTPS media upload');
  const headers={...(q.upload_headers||{})};
  if(!Object.keys(headers).some(x=>x.toLowerCase()==='content-type'))headers['Content-Type']='video/mp4';
  const up=await fetch(q.upload_url,{method:'PUT',headers,body:bytes,signal:AbortSignal.timeout(120000)});
  if(!up.ok)throw new Error('Temporary media storage PUT returned HTTP '+up.status);
  const row={status:'uploaded',id:shot.id,chapter:shot.chapter,
    public_url:q.public_url,size_bytes:bytes.byteLength,finished_at:new Date().toISOString()};
  await dest.setJSON(k,row);
  return row;
}
export default {
 async deploySucceeded(){
   const state=getStore(TRANSFER);
   const already=await state.get('full_done',{type:'json'});
   if(already?.status==='complete')return;
   const counts={checked:0,uploaded:0,failed:0,first_errors:[],started_at:new Date().toISOString()};
   for(let i=0;i<target.length;i+=4){
     const batch=target.slice(i,i+4);
     const rows=await Promise.allSettled(batch.map(s=>processOne(s)));
     for(let j=0;j<rows.length;j++){
       counts.checked++;
       if(rows[j].status==='fulfilled')counts.uploaded++;
       else {counts.failed++;if(counts.first_errors.length<8)counts.first_errors.push({id:batch[j].id,error:String(rows[j].reason?.message||rows[j].reason).slice(0,180)});}
     }
     await state.setJSON('full_progress',{...counts,updated_at:new Date().toISOString()});
   }
   const done={...counts,status:counts.failed===0&&counts.uploaded===target.length?'complete':'partial',finished_at:new Date().toISOString()};
   await state.setJSON('full_done',done);
 },
 async fetch(req){
   if(req.method!=='GET')return new Response('Method not allowed',{status:405});
   const state=getStore(TRANSFER);
   const progress=await state.get('full_progress',{type:'json'});
   const done=await state.get('full_done',{type:'json'});
   const rows=await Promise.all(target.map(s=>state.get('transfer/'+s.id,{type:'json'})));
   return Response.json({
     episode:'EP007',
     target:target.length,
     transferred:rows.filter(x=>x?.status==='uploaded'&&x?.public_url).length,
     progress:progress??null,
     done:done??null,
     assets:target.map((s,i)=>({
       id:s.id,chapter:s.chapter,status:rows[i]?.status||'waiting',
       public_url:rows[i]?.status==='uploaded'?rows[i]?.public_url:null,
       size_bytes:rows[i]?.size_bytes??null
     }))
   },{headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','Referrer-Policy':'no-referrer'}});
 }
};
