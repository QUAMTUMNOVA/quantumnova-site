// Temporary, read-only Higgsfield API credential validation.
// Queries the documented Marketing Studio preset catalog; never submits generation or spends API credits.
export default async (request) => {
  if (request.method !== "GET") return new Response("Method not allowed", {status:405});
  const key = Netlify.env.get("HF_KEY") || "";
  if (!key) return Response.json({key_configured:false,api_authenticated:false}, {status:503,headers:{"Cache-Control":"no-store"}});
  try {
    const result = await fetch("https://api.higgsfield.ai/marketing-studio/image/presets?size=1", {
      method:"GET", headers:{"Authorization":"Key "+key,"Accept":"application/json"},
      signal:AbortSignal.timeout(12000)
    });
    return Response.json({key_configured:true,api_authenticated:result.ok,
      api_http_status:result.status,
      note:"Read-only API credential verification; no generation submitted."}, {
      status:200,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"}
    });
  } catch(error) {
    return Response.json({key_configured:true,api_authenticated:false,api_http_status:null,error:"API connection failed"}, {
      status:502,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"}
    });
  }
};
export const config = { rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:2} };
