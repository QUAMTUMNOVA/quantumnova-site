import { getStore } from '@netlify/blobs';
// Public read-only progress — never expose credentials, billable routes, request IDs or media URLs.
export default async function(req){
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 try {
 const store=getStore('btk-production-ep001');
 const run=await store.get('run',{type:'json'});
 const shots=[];
 for(const [id,label] of [['001','Deserted Manhattan avenue'],['003','Passenger aircraft above clouds'],['006','Unattended electrical-grid control room']]){
   const record=await store.get('jobs/EP001/'+id,{type:'json'});
   shots.push({id,label,state:record?.state||'planned'});
 }
 return Response.json({episode:'EP001',stage:run?.state||'not_started',shots,
    publication:'approval_required',autopublish:false}, {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
 }catch{return Response.json({episode:'EP001',stage:'unavailable',shots:[],publication:'approval_required',autopublish:false},
   {status:503,headers:{'Cache-Control':'no-store'}});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:20}};
