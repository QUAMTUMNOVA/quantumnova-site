# SF012 — Final QA and release (10 November 2026)

**Title:** How Does a Candle Relight From Smoke?
**Status:** Finished, tested and automatically scheduled in Metricool for YouTube Shorts and Facebook Reels. User approved extending the QNova queue.

## Final original 9:16 masters and cover
- YouTube video (38.106 sec): https://d2ol7oe51mr4n9.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/ada7d4b4-9c70-4221-8afa-6cfe2dc1c5b3.mp4
- Facebook video (38.106 sec): https://d2ol7oe51mr4n9.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/76bcde57-dec8-4849-96b8-3f7b5d016a24.mp4
- Original **vertical 1080×1920** cover: https://d2ol7oe51mr4n9.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/7971361a-d0ee-4e0b-ab2e-f4eb90ec64f0.jpg

## QA
- 8 **distinct original 5-second source clips**, each unique SHA hash, completed via developer API at quoted **US$1.68** (≤US$3 cap).
- Two complete separately branded CTA masters; 720×1280 H.264, 24fps, AAC audio, 22 clean word-timed subtitle cues and no stray slash/backslash cues.
- Video decoded fully by FFmpeg `-xerror` without decode errors; custom cover dimensions verified 1080×1920. All 3 media assets uploaded and HTTP-206 tested via QNova media CDN.
- Original music and established Fraser documentary narrator. Designed cover inserted as opening film frames as fallback for YouTube Shorts preview selection.

## Scheduled publication — Australia/Sydney (AEDT)
- YouTube: **2026-11-30 12:00**, Metricool id `422734738`, type `short`, audience not made for kids, AI synthesis disclosure true; [planner](https://app.metricool.com/planner/calendar?blogId=7960478&openWithPostUuid=-7960705201247336157).
- Facebook: **2026-11-30 12:20**, Metricool id `422734766`, type `REEL`, platform-specific like/follow outro; [planner](https://app.metricool.com/planner/calendar?blogId=7960478&openWithPostUuid=-9123633577548299558).
- Both bookings re-read from Metricool: `PENDING`, `autoPublish:true`, `draft:false`, one video attached and `videoThumbnailUrl` attached.

## Mandatory YouTube-thumbnail follow-up
**Metricool accepting a custom-thumbnail URL does NOT prove the actual Short displays it in YouTube's interface.** Check in YouTube Studio *after* YouTube processes the upload. YouTube's current 2026 help instructs verified channels to select Shorts → edit → Thumbnail → Upload file on desktop. If direct thumbnail unavailable, the original cover also appears in the first 10 frames for frame selection. Never tell the owner the displayed thumbnail is confirmed merely from Metricool status. Source: https://support.google.com/youtube/answer/72431.

## Security
One-time Netlify source transfer for this project was completed; export URL/status functions are removed from deployed branch following final media retrieval.
