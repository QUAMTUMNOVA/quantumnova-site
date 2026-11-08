import {getStore} from '@netlify/blobs';
const IDS=Array.from({length:20},(_,i)=>String(301+i));
export default async function(){
 const store=getStore('btk-ep001-v4'),assets=getStore('btk-ep001-v4-media');
 let n=0;
 for(const id of IDS){
  if(n>=2)break;
  const row=await store.get('shot/'+id,{type:'json'});
  if(row?.state!=='completed'||!row?.result_url||row.stored_asset)continue;
  try{
   const path='original/'+id+'.mp4';
   const exists=await assets.getMetadata(path);
   if(exists){await store.setJSON('shot/'+id,{...row,stored_asset:path});continue}
   const url=new URL(row.result_url);
   if(url.protocol!=='https:'||!url.hostname.endsWith('.cloudfront.net'))continue;
   const res=await fetch(url,{signal:AbortSignal.timeout(20000)});
   if(!res.ok)continue;
   const length=Number(res.headers.get('content-length')||0);
   if(length>45000000)continue;
   const blob=await res.blob();
   if(blob.size<5000||blob.size>45000000)continue;
   await assets.set(path,blob,{metadata:{id,version:'V4',episode:'EP001',kind:'video',chapter:row.chapter}});
   await store.setJSON('shot/'+id,{...row,stored_asset:path,archived_at:new Date().toISOString()});
   n++;
  }catch(e){console.warn('V4 archival delayed for '+id)}
 }
 console.info('V4 media archived: '+n);
}
export const config={schedule:'4,14,24,34,44,54 * * * *'};
