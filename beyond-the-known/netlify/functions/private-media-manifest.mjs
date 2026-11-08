import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
const TOKEN_SHA256='867b59b99d82095b98595d95295e6f96e971ca81a1292d3be61bba97fee17ac7';
const shots=["002","004","005","007","009","010","012","013","014","015","017","019","020","023","026","027","008","011","016","018","021","022","024","025","028","029","030","031","032","033","034"];
export default async (req)=>{
  const supplied=req.headers.get('authorization')||'';
  const prefix='Bearer ';
  const header=supplied.startsWith(prefix)?supplied.slice(prefix.length):'';
  const got=createHash('sha256').update(header).digest();
  const expected=Buffer.from(TOKEN_SHA256,'hex');
  if(!header||!timingSafeEqual(got,expected))return Response.json({error:'forbidden'},{status:403,headers:{'Cache-Control':'no-store'}});
  if(req.method!=='GET')return Response.json({error:'method'},{status:405});
  const jobs=getStore('btk-production-ep001');
  const assets=getStore('btk-ep001-media');
  const items=await Promise.all(shots.map(async id=>{
    const record=await jobs.get('full/jobs/'+id,{type:'json'});
    const key=record?.stored_asset||null;
    return {id,kind:record?.kind,state:record?.state,result_url:record?.result_url||null,
       stored_asset:key,stored_exists:key?!!(await assets.getMetadata(key)):false};
  }));
  const pilot=await Promise.all(['001','003','006'].map(async id=>{const r=await jobs.get('jobs/EP001/'+id,{type:'json'});return {id,kind:r?.kind,state:r?.state,result_url:r?.result_url||null,stored_asset:r?.stored_asset||null,stored_exists:false};}));
  const v2store=getStore('btk-production-ep001-v2');
  const v2=await Promise.all(['110','111','112','113','114','115'].map(async id=>{
    const r=await v2store.get('jobs/'+id,{type:'json'});
    return {id,kind:'video',state:r?.state||'queued',result_url:r?.result_url||null,request_id:r?.request_id||null};
  }));
  const v3store=getStore('btk-ep001-v3');
  const v3=await Promise.all(Array.from({length:12},(_,i)=>String(201+i)).map(async id=>{
   const r=await v3store.get('shot/'+id,{type:'json'});
   return {id,beat:r?.beat||null,kind:'video',state:r?.state||'planned',result_url:r?.result_url||null,request_id:r?.request_id||null};
  }));
  return Response.json({episode:'EP001',items:[...items,...pilot,...v2,...v3]},
    {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
};
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:10}};
