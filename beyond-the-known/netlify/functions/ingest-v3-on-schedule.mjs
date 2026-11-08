import {getStore} from '@netlify/blobs';
const ids=Array.from({length:28},(_,i)=>String(201+i));
export default async function(){
 const jobs=getStore('btk-ep001-v3');
 const media=getStore('btk-ep001-v3-media');
 let count=0;
 for(const id of ids){
   if(count>=2)break;
   const key='shot/'+id;
   const job=await jobs.get(key,{type:'json'});
   if(!job||job.state!=='completed'||!job.result_url||job.stored_asset)continue;
   const target='original/'+id+'.mp4';
   try{
     const existing=await media.getMetadata(target);
     if(existing){await jobs.setJSON(key,{...job,stored_asset:target,updated_at:new Date().toISOString()});continue}
     const url=new URL(job.result_url);
     if(url.protocol!=='https:'||!url.hostname.endsWith('.cloudfront.net'))continue;
     const response=await fetch(url,{signal:AbortSignal.timeout(19000)});
     if(!response.ok)continue;
     const length=Number(response.headers.get('content-length')||0);
     if(length>45000000)continue;
     const blob=await response.blob();
     if(blob.size<5000||blob.size>45000000)continue;
     await media.set(target,blob,{metadata:{episode:'EP001',version:'V3',id,beat:job.beat,kind:'video'}});
     await jobs.setJSON(key,{...job,stored_asset:target,stored_at:new Date().toISOString(),updated_at:new Date().toISOString()});
     count++;
   }catch(e){console.warn('V3 asset ingest delayed '+id)}
 }
 console.info('V3 archive persisted '+count+' additional original video assets');
}
export const config={schedule:'4,14,24,34,44,54 * * * *'};
