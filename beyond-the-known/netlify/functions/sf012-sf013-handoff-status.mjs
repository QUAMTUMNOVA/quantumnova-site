import {getStore} from '@netlify/blobs';
import {SHOTS as A} from '../../shorts/scenario-files/sf012/SF012-shot-queue-data.mjs';
import {SHOTS as B} from '../../shorts/scenario-files/sf013/SF013-shot-queue-data.mjs';
export default async function(request){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 const all=[...A,...B];
 const st=getStore('btk-qnova-sf012-sf013-handoff');
 const rows=await Promise.all(all.map(s=>st.get('asset/'+s.id,{type:'json'})));
 return Response.json({target:all.length,complete:rows.filter(x=>x?.url).length,
  assets:all.map((s,i)=>({id:s.id,url:rows[i]?.url||null,size_bytes:rows[i]?.size||null})),
  progress:await st.get('progress',{type:'json'})},
 {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','Referrer-Policy':'no-referrer'}});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:10}};
