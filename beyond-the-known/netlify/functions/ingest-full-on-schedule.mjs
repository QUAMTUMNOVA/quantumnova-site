import {getStore} from '@netlify/blobs';
// Download completed Higgsfield assets into persistent QNova Netlify Blobs.
// Does not create new generations, incur Higgsfield generation charges or publish any media.
const ids=["002","004","005","007","009","010","012","013","014","015","017","019","020","023","026","027","008","011","016","018","021","022","024","025","028","029","030","031","032","033","034"];
const jobs=getStore('btk-production-ep001');
const assets=getStore('btk-ep001-media');
export default async function(){
  let saved=0;
  for(const id of ids){
    if(saved>=2)break;
    const job=await jobs.get('full/jobs/'+id,{type:'json'});
    if(!job||job.state!=='completed'||!job.result_url||job.stored_asset)continue;
    const key='original/'+id+(job.kind==='video'?'.mp4':'.png');
    const exists=await assets.getMetadata(key);
    if(exists){
      await jobs.setJSON('full/jobs/'+id,{...job,stored_asset:key,storage_verified_at:new Date().toISOString()});
      continue;
    }
    try{
      const url=new URL(job.result_url);
      if(url.protocol!=='https:')continue;
      // Limit size and duration of each transfer.
      const response=await fetch(url,{signal:AbortSignal.timeout(16000)});
      if(!response.ok)continue;
      const length=Number(response.headers.get('content-length')||0);
      if(length>35000000)continue;
      const blob=await response.blob();
      if(blob.size>35000000)continue;
      await assets.set(key,blob,{metadata:{episode:'EP001',shot:id,kind:job.kind}});
      await jobs.setJSON('full/jobs/'+id,{...job,stored_asset:key,storage_verified_at:new Date().toISOString()});
      saved++;
    }catch(err){console.warn('[BTK] ingestion delayed for '+id);}
  }
  console.info('[BTK] persisted '+saved+' EP001 assets on this pass');
}
export const config={schedule:'5,15,25,35,45,55 * * * *'};
