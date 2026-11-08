// Read-only connection check. Does not reveal or use the API secret.
// A configured key is NOT a verified Higgsfield API authentication.
export default async (request) => {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const key = typeof Netlify !== "undefined" ? Netlify.env.get("HF_KEY") : process.env.HF_KEY;
  return Response.json({
    project: "Beyond the Known",
    owner: "QNova",
    service: "Netlify functions",
    service_ready: true,
    higgsfield_key_configured: Boolean(key),
    higgsfield_auth_verified: false,
    generation_enabled: false,
    publication_enabled: false,
    episode: "EP001",
    production_state: "setup",
    note: "API key presence only; external authentication, spending and publishing have not been tested."
  }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
};
