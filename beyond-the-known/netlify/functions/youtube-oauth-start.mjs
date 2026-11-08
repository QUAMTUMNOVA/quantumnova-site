import {getStore} from '@netlify/blobs';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
const CALLBACK='https://qnova-beyond-the-known.netlify.app/.netlify/functions/youtube-oauth-callback';
const CHANNEL='UCJEXEKS8QjlZFivQIeUHrXQ';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none';style-src 'unsafe-inline';form-action 'self';base-uri 'none'"};
function page(msg,status=200){return new Response('<!doctype html><meta charset="utf-8"><title>QNova YouTube connection</title><main style="font:16px system-ui,sans-serif;max-width:650px;margin:10vh auto;line-height:1.6"><h1>QNova YouTube connection</h1>'+msg+'</main>',{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8'}})}
function same(a,b){return timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest())}
export default async function(req){
 if(!['GET','POST'].includes(req.method))return page('<p>Method not allowed.</p>',405);
 const id=Netlify.env.get('QNOVA_YT_CLIENT_ID'),secret=Netlify.env.get('QNOVA_YT_CLIENT_SECRET');
 const setup=Netlify.env.get('QNOVA_YT_SETUP_KEY'),enc=Netlify.env.get('QNOVA_YT_ENCRYPTION_KEY');
 if(!id||!secret||!setup||!enc)return page('<p>Secure OAuth credentials are not configured yet. Complete the Netlify environment variable setup first.</p>',503);
 if(req.method==='GET')return page('<p>Connect <b>Beyond the Known | QNova</b> to the QNova publishing backend. No videos will be uploaded or published by this step.</p><form method="post" action="/.netlify/functions/youtube-oauth-start"><label>Private setup password <input name="key" type="password" required autocomplete="off"></label><p><button type="submit">Connect YouTube securely</button></p></form>');
 let form;try{form=await req.formData()}catch{return page('<p>Invalid form data.</p>',400)}
 const key=form.get('key');
 if(typeof key!=='string'||key.length>512||!same(key,setup))return page('<p>Incorrect setup password.</p>',403);
 const state=randomBytes(32).toString('base64url');
 const claim=await getStore('qnova-yt-oauth').setJSON('pending/'+state,{createdAt:Date.now(),expectedChannelId:CHANNEL},{onlyIfNew:true});
 if(!claim.modified)return page('<p>Could not reserve authorisation request.</p>',503);
 const u=new URL('https://accounts.google.com/o/oauth2/v2/auth');
 for(const [k,v] of Object.entries({client_id:id,redirect_uri:CALLBACK,response_type:'code',scope:'https://www.googleapis.com/auth/youtube',access_type:'offline',prompt:'consent select_account',state}))u.searchParams.set(k,v);
 return new Response(null,{status:302,headers:{...headers,Location:u.toString()}});
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:8}};
