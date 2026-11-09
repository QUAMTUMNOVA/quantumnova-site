import {getStore} from '@netlify/blobs';
import {SHOTS} from '../../episodes/ep007/EP007-shot-queue-data.mjs';

// One-time owner-authorized private-media handoff. Existing original shots are copied
// directly FROM Netlify private Blobs TO a temporary Higgsfield API media upload.
// No source bytes, API key or signed upload URL are returned to the browser.
// Controlled pilot: first one shot only, full copy after pilot validation.
const target=SHOTS.slice(0,1);
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
   const state=getStore(TRANSFER), id=target[0].id;
   try {const result=await processOne(target[0]);await state.setJSON('pilot',{status:'success',shot:id,size_bytes:result.size_bytes,checked_at:new Date().toISOString()});}
   catch(e){await state.setJSON('pilot',{status:'failed',shot:id,error:String(e?.message||e).slice(0,200),checked_at:new Date().toISOString()});}
 },
 async fetch(req){
   if(req.method!=='GET')return new Response('Method not allowed',{status:405});
   const state=getStore(TRANSFER);
   const pilot=await state.get('pilot',{type:'json'});
   const one=await state.get('transfer/'+target[0].id,{type:'json'});
   return Response.json({episode:'EP007',pilot:pilot??{status:'waiting'},one:one?{status:one.status,id:one.id,public_url:one.public_url,size_bytes:one.size_bytes}:null},
    {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow'}});
 }
};
