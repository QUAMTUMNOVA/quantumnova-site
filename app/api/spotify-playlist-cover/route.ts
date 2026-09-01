const SPOTIFY_PLAYLIST_ID = /^[A-Za-z0-9]{22}$/;

const fallbackSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="70%">
      <stop offset="0" stop-color="#17302e"/>
      <stop offset="0.48" stop-color="#090d16"/>
      <stop offset="1" stop-color="#010204"/>
    </radialGradient>
  </defs>
  <rect width="640" height="640" fill="url(#bg)"/>
  <circle cx="320" cy="320" r="142" fill="none" stroke="#88ffe4" stroke-opacity=".18"/>
  <circle cx="320" cy="320" r="96" fill="none" stroke="#8b6cff" stroke-opacity=".18"/>
  <text x="320" y="352" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="112" font-weight="700" fill="#bfffee">Q</text>
</svg>`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";

  if (!SPOTIFY_PLAYLIST_ID.test(id)) {
    return new Response(fallbackSvg, {
      status: 400,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  try {
    const playlistUrl = `https://open.spotify.com/playlist/${id}`;
    const response = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(playlistUrl)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) throw new Error("Spotify oEmbed request failed");

    const payload = (await response.json()) as { thumbnail_url?: string };
    if (!payload.thumbnail_url?.startsWith("https://")) {
      throw new Error("Spotify playlist artwork missing");
    }

    return Response.redirect(payload.thumbnail_url, 307);
  } catch {
    return new Response(fallbackSvg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  }
}
