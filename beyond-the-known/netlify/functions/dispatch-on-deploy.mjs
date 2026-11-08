import {getStore} from '@netlify/blobs';
// Approved single-run pilot test. Server-side platform event only; no public generation route.
// Does not retry uncertain submissions, does not publish to YouTube.
const siteId='a31be4b6-9c59-47d9-b387-3cf0ab9a72b1';
const tasks=[
{id:'001',label:'Deserted Manhattan avenue',kind:'video',max_usd:1.5,
path:'alibaba/wan-3.0/text-to-video',
body:{duration:5,resolution:'720p',aspect_ratio:'16:9',generate_audio:false,
prompt:'Single continuous photorealistic cinematic documentary shot of a deserted present-day Manhattan avenue after all humans have vanished. Abandoned vehicles stopped at odd angles, empty sidewalks, functioning traffic signals, subtle morning haze and paper stirring in the wind. Slow steady forward dolly, real architecture and physically plausible light, 35mm lens, 16:9. No people, bodies, destruction, fantasy vanishing effects, captions, logos or cuts.'}},
{id:'003',label:'Passenger aircraft above clouds',kind:'image',max_usd:.5,
path:'marketing-studio/image',
body:{resolution:'1k',quality:'low',aspect_ratio:'16:9',enhance_prompt:false,
prompt:'Original photorealistic documentary-style cinematic still of a contemporary commercial passenger aircraft high above sunlit morning clouds. Technically plausible aircraft silhouette, natural sky, wide landscape composition, no passengers visible, no typography, logos, advertisements or watermarks.'}},
{id:'006',label:'Unattended electrical-grid control room',kind:'video',max_usd:2,
path:'kling-video/v3.0/std/text-to-video',
body:{duration:5,aspect_ratio:'16:9',sound:'off',multi_shots:false,
prompt:'One uninterrupted realistic cinematic documentary shot inside an unmanned modern electrical grid control room after operators disappear. Rows of illuminated status displays, switches and equipment. Gentle camera push forward as one panel subtly dims, practical industrial lighting, physically plausible technology. No people, explosions, sparks, fantastical graphics, text, logos or cuts.'}}
];
async function once(){
 const key=Netlify.env.get('HF_KEY');
 if(!key){console.warn('[BTK] HF_KEY missing; no submission');return;}
 const reserved=tasks.reduce((n,t)=>n+t.max_usd,0);
 if(reserved>5) throw Error('Budget planning guard rejected batch');
 const store=getStore('btk-production-ep001');
 const got=await store.setJSON('run',{state:'started',started_at:new Date().toISOString(),planned_max_usd:5},{onlyIfNew:true});
 if(!got.modified){console.info('[BTK] One-time batch already claimed');return;}
 let n=0;
 for(const t of tasks){
   const k='jobs/EP001/'+t.id;
   const obj={id:t.id,label:t.label,kind:t.kind,model:t.path,state:'submitting',updated_at:new Date().toISOString()};
   const lock=await store.setJSON(k,obj,{onlyIfNew:true});
   if(!lock.modified)break;
   try{
     const response=await fetch('https://api.higgsfield.ai/'+t.path,{
       method:'POST',headers:{Authorization:'Key '+key,'Content-Type':'application/json',Accept:'application/json'},
       body:JSON.stringify(t.body),signal:AbortSignal.timeout(23000)});
     // Never log raw payloads: errors may contain private signed file links.
     const data=await response.json().catch(()=>({}));
     const rid=typeof data.request_id==='string'?data.request_id:null;
     const state=response.ok?(rid?'submitted':'outcome_unknown'):'submission_rejected';
     await store.setJSON(k,{...obj,state,request_id:rid,api_http_status:response.status,updated_at:new Date().toISOString()});
     console.info('[BTK] Shot '+t.id+': '+state+' (HTTP '+response.status+')');
     if(state!=='submitted')break;
     n++;
   }catch(e){
     // A timeout can still bill: stop permanently until a human reconciles it.
     await store.setJSON(k,{...obj,state:'outcome_unknown',updated_at:new Date().toISOString()});
     console.warn('[BTK] Ambiguous API submission; no retry');break;
   }
 }
 await store.setJSON('run',{state:n===tasks.length?'submitted':'manual_review_required',
     submitted_count:n,updated_at:new Date().toISOString(),planned_max_usd:5});
}
export default {
  async deploySucceeded(event) {
    if(event?.site?.id!==siteId)return;
    if(event?.deploy?.context && event.deploy.context!=='production')return;
    try{await once();}catch(e){console.warn('[BTK] Worker failed; no automatic retry');}
  }
};
