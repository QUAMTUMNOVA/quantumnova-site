import {getStore} from '@netlify/blobs';
import {SHOTS} from '../../shorts/scenario-files/sf001/SF001-shot-queue-data.mjs';
// Read only provider status, archive original generated video in private Netlify Blobs.
export default async function(){
 const key=Netlify.env.get('HF_KEY'); if(!key)return;
 const jobs=getStore('btk-sf001-api'), media=getStore('btk-sf001-videos');
 let checked=0,archived=0;
 for(const shot of SHOTS.slice(0,3)){
  const k='shot/'+shot.id;
  let row=await jobs.get(k,{type:'json'});
  if(!row?.request_id)continue;
  if(!['completed','failed','canceled','nsfw'].includes(row.state)){
   try{
    const r=await fetch('https://api.higgsfield.ai/requests/'+encodeURIComponent(row.request_id)+'/status',{
      headers:{Authorization:'Key '+key,Accept:'application/json'},signal:AbortSignal.timeout(12000)});
    if(r.ok){
      const j=await r.json();
      const state=j.status||j.request?.status||'processing';
      const result=j.result||j.output||j;
      const url=result?.video?.url||(typeof result?.video==='string'?result.video:null);
      row={...row,state,updated_at:new Date().toISOString(),...(state==='completed'&&typeof url==='string'&&url.startsWith('https://')?{result_url:url}:{})};
      await jobs.setJSON(k,row);checked++;
    }
   }catch{console.warn('SF001 status read deferred for '+shot.id)}
  }
  if(row.state==='completed'&&row.result_url&&!row.stored_asset){
   try{
    const dst='original/'+shot.id+'.mp4';
    if(!(await media.getMetadata(dst))){
      const u=new URL(row.result_url);
      if(u.protocol!=='https:'||!u.hostname.endsWith('.cloudfront.net'))continue;
      const r=await fetch(u.toString(),{signal:AbortSignal.timeout(20000)});
      if(!r.ok)continue;
      if(Number(r.headers.get('content-length')||0)>50000000)continue;
      const blob=await r.blob();
      if(blob.size<5000||blob.size>50000000)continue;
      await media.set(dst,blob,{metadata:{episode:'SF001',id:shot.id,chapter:String(shot.chapter),kind:'video',private:'true'}});
    }
    await jobs.setJSON(k,{...row,stored_asset:dst,updated_at:new Date().toISOString()});
    archived++;
   }catch{console.warn('SF001 media archival deferred for '+shot.id)}
  }
 }
 console.info('SF001 pilot checked '+checked+' archived '+archived);
}
export const config={schedule:'*/3 * * * *'};
