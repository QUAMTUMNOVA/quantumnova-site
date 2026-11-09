# EP007 — Narration assets and final assembly gate (10 November 2026)

**Title:** The Town That Burned from Below | Centralia
**State:** **NOT YET AN ASSEMBLED PRIVATE MASTER.** Do not schedule or publish without user approval.

## Verified current state

- Netlify production state from `ep007-api-progress`: **60 of 60 distinct original footage shots completed and archived privately**, quoted API footage **US$12.60 / US$13** budget cap.
- **Five of five Fraser narration chapters completed** (Seed Audio, preset voice ID `6705e465-7b52-5915-a1d8-b1222885e01d`, rate -5, MP3 at 24 kHz). All five media downloaded and individually probed using FFprobe from their actual CDN URLs. These narrations are not yet approved after listening QA.
- Source script: `EP007_Narration_Script_v1.md`; unique planned video shot manifest: `EP007-shot-queue-data.mjs` (60 shots).
- Combined raw voice audio: **340.656 seconds (5:40.656)**, before transitions, score, CTA and technical trims. Requested full episode target remains **4–6 minutes**.
- Source footage is in authenticated Netlify Blobs store `btk-ep007-videos`. No unauthenticated source export should be exposed. Existing private-export function remains original-token restricted; its original access configuration has been restored. The transfer/assembly remains outstanding.

| Chapter | Name | Audio duration | Distinct moving shots | Avg intended displayed shot length |
|---|---|---:|---:|---:|
| 1 | A Hole in the Ground | 57.648s | 10 | 5.76s |
| 2 | The Fire That Disappeared | 63.840s | 11 | 5.80s |
| 3 | An Invisible Neighbour | 67.224s | 11 | 6.11s |
| 4 | The Price of Leaving | 70.728s | 12 | 5.89s |
| 5 | The Town Above the Fire | 81.216s | 16 | 5.08s |

## Generated audio references (each was completed and HTTP-downloaded)

- Chapter 1: job `52111a74-b8da-4718-b549-d367a374d250` — https://d8j0ntlcm91z4.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/hf_20261109_131145_52111a74-b8da-4718-b549-d367a374d250.mp3
- Chapter 2: job `67b502a0-a31a-4c13-a7a3-d45d24138c02` — https://d8j0ntlcm91z4.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/hf_20261109_131144_67b502a0-a31a-4c13-a7a3-d45d24138c02.mp3
- Chapter 3: job `81adee4b-e785-4ed2-bf53-e167b646e58e` — https://d8j0ntlcm91z4.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/hf_20261109_131144_81adee4b-e785-4ed2-bf53-e167b646e58e.mp3
- Chapter 4: job `7c61c48d-84f8-42ab-ac20-a23441a68432` — https://d8j0ntlcm91z4.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/hf_20261109_131144_7c61c48d-84f8-42ab-ac20-a23441a68432.mp3
- Chapter 5: job `12f30e70-4050-4fc4-9e97-14140f0f33d8` — https://d8j0ntlcm91z4.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/hf_20261109_131145_12f30e70-4050-4fc4-9e97-14140f0f33d8.mp3

## Remaining gate to private review

1. Authorised, credential-safe copy of all 60 archived unique clips into the protected editing workspace, verify 60 distinct sources with frame counts, duration, successful decode and no missing clips. Do not expose Netlify Blobs publicly.
2. Listen to each of 5 generated Fraser chapter WAV/MP3 tracks for skipped sentences, wrong pronunciations, glitches and consistent timbre; regenerate only an actual issue, not by default.
3. Align shot durations to the exact audio chapter lengths. Most 5s source shots should be presented around 5.1–6.1s at a modest speed adjustment; DO NOT replay or duplicate source shots. Account for chapter cuts and intro/outro.
4. Create original atmospheric score or use licensed QNova original score; mix narration consistently and master loudness. Use a five-chapter documentary 16:9 edit and a concise hook.
5. Generate properly timed English subtitles from **finished** narration, no manual `\\N` ASS hardline breaks or stray slash/backslash. Subtitle quality checks and proof frame screenshots. Create custom thumbnail and SEO metadata.
6. Render **two separate 16:9 final masters**: YouTube CTA `SUBSCRIBE TO BEYOND THE KNOWN`; Facebook CTA `LIKE & FOLLOW BEYOND THE KNOWN`; same unique generated video sources, no duplicate paid generation.
7. Run full-file FFmpeg video/audio QA, file hash and check that CDN playback is HTTP accessible. Deliver private review link to owner. **No public Metricool scheduling until explicit owner approval**.

**Free-generation note:** MCP balance check on 10 Nov reported `free_trial.unlim_available=false` and only 3 constrained Genjutsu grants + 35 AI influencer sheet grants. The seven-day *website* promotion cannot be assumed available to API or MCP. No further paid footage was submitted in this run.
