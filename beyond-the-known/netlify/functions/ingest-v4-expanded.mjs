import {getStore} from '@netlify/blobs';
// Automatically save paid V4 outputs in private Netlify storage.
// No re-generations; checks existing blob before copy. Does not reveal media publicly.
export default async function(){
 const jobs=getStore('btk-ep001-v4'),media=getStore('btk-ep001-v4-media');
 let copied=0;
 for(let i=321;i<=346;i++){
  if(copied>=3)break;
  const id=String(i),key='shot/'+id;
  const j=await jobs.get(key,{type:'json'});
  if(j?.state!=='completed'||!j.result_url||j.stored_asset)continue;
  const dest='original/'+id+'.mp4';
  try{
   if(await media.getMetadata(dest)){
    await jobs.setJSON(key,{...j,stored_asset:dest,updated_at:new Date().toISOString()});continue;
   }
   const url=new URL(j.result_url);
   if(url.protocol!=='https:'||!url.hostname.endsWith('.cloudfront.net'))continue;
   const r=await fetch(url,{signal:AbortSignal.timeout(20000)});
   if(!r.ok)continue;
   if(Number(r.headers.get('content-length')||0)>45000000)continue;
   const file=await r.blob();
   if(file.size<5000||file.size>45000000)continue;
   await media.set(dest,file,{metadata:{episode:'EP001',version:'V4',id,chapter:String(j.chapter),kind:'video'}});
   await jobs.setJSON(key,{...j,stored_asset:dest,updated_at:new Date().toISOString()});
   copied++;
  }catch(e){console.warn('V4 save postponed '+id)}
 }
 console.info('V4 videos newly archived '+copied);
}
export const config={schedule:'4,9,14,19,24,29,34,39,44,49,54,59 * * * *'};
