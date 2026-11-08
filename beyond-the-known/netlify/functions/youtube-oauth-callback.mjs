import {getStore} from '@netlify/blobs';
import {createCipheriv,randomBytes} from 'node:crypto';
const CALLBACK='https://qnova-beyond-the-known.netlify.app/.netlify/functions/youtube-oauth-callback';
const CHANNEL='UCJEXEKS8QjlZFivQIeUHrXQ';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none';style-src 'unsafe-inline';base-uri 'none'"};
function page(msg,status=200){return new Response('<!doctype html><meta charset="utf-8"><title>QNova YouTube authorisation</title><main style="font:16px system-ui,sans-serif;max-width:650px;margin:10vh auto;line-height:1.6"><h1>QNova YouTube authorisation</h1><p>'+msg+'</p></main>',{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8'}})}
export default async function(req){
 if(req.method!=='GET')return page('Method not allowed.',405);
 const u=new URL(req.url);
 if(u.searchParams.has('error'))return page('Google authorisation was cancelled or denied. No credentials saved.',400);
 const state=u.searchParams.get('state')||'',code=u.searchParams.get('code')||'';
 if(!/^[A-Za-z0-9_-]{40,80}$/.test(state)||!code||code.length>3000)return page('Invalid or missing authorisation response.',400);
 const store=getStore('qnova-yt-oauth'),key='pending/'+state;
 const pending=await store.get(key,{type:'json'});
 if(!pending||pending.expectedChannelId!==CHANNEL||!Number.isFinite(pending.createdAt)||Date.now()-pending.createdAt>600000)return page('Authorisation request expired or invalid. Start again.',400);
 await store.delete(key);
 const id=Netlify.env.get('QNOVA_YT_CLIENT_ID'),secret=Netlify.env.get('QNOVA_YT_CLIENT_SECRET'),hex=Netlify.env.get('QNOVA_YT_ENCRYPTION_KEY')||'';
 const encryptionKey=/^[0-9a-f]{64}$/i.test(hex)?Buffer.from(hex,'hex'):null;
 if(!id||!secret||!encryptionKey||encryptionKey.length!==32)return page('Secure configuration incomplete. No credentials saved.',503);
 try{
  const res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:id,client_secret:secret,code,grant_type:'authorization_code',redirect_uri:CALLBACK}),signal:AbortSignal.timeout(16000)});
  if(!res.ok)return page('Google token exchange failed. Check the client ID and registered redirect URI; retry authorisation.',400);
  const token=await res.json();
  if(!token.access_token||!token.refresh_token)return page('Google did not grant an offline refresh token. Restart and grant consent.',400);
  const list=await fetch('https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true',{headers:{Authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(15000)});
  if(!list.ok)return page('Could not verify YouTube channel. Nothing saved.',400);
  const channels=await list.json(),selected=(channels.items||[]).find(x=>x.id===CHANNEL);
  if(!selected)return page('Wrong YouTube channel authorised. Select Beyond the Known | QNova as the default channel and retry. Nothing saved.',400);
  const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',encryptionKey,iv);
  const encrypted=Buffer.concat([c.update(token.refresh_token,'utf8'),c.final()]);
  await store.setJSON('channels/'+CHANNEL,{channelId:CHANNEL,channelName:selected.snippet?.title||'Beyond the Known | QNova',updatedAt:new Date().toISOString(),refresh:{algorithm:'aes-256-gcm',iv:iv.toString('base64'),tag:c.getAuthTag().toString('base64'),ciphertext:encrypted.toString('base64')},scope:token.scope||'youtube'});
  return page('<b>Connected securely:</b> Beyond the Known | QNova. Encrypted offline authorisation saved. Nothing uploaded or published.');
 }catch{return page('Google or YouTube did not respond. No new connection confirmed. Retry.',503)}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:12}};
