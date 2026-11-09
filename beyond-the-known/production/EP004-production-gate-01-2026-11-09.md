# Beyond the Known — Episode 004 production gate 01 (9 Nov 2026)

**Title:** The First City in Space — Could Humanity Actually Build One?  
**Status:** User explicitly approved full documentary production. **FULL PRIVATE MASTER NOT YET READY; DO NOT PUBLISH OR SCHEDULE EP004 before user's separate review approval.**

## Latest creative direction
- Positive, aspirational near-future engineering documentary rather than a fourth apocalypse/ancient story.
- Serious original Fraser narration, moving photoreal cinematic visuals, vary human street life, vast aerials, large engineering, greenhouse and water recovery, interior and exterior.
- Treat rotating settlement as possible theoretical architecture (not existing NASA city); credible centripetal mechanics, near-microgravity hub, radiation/micrometeoroid shielding, actual pressure containment and ecological trade-offs.
- Nine-chapter v2 narration text: `beyond-the-known/episodes/ep004/EP004_Narration_Script_v2.md`.
- Research sources: NASA rotating kilometre-scale NIAC study `https://www.nasa.gov/general/kilometer-scale-space-structures-from-a-single-launch-2/`; NASA ECLSS `https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/`; 1975 NASA/Stanford design `https://space.nss.org/stanford-torus-space-settlement/`. Never visually misrepresent a real operating city.

## Audio and timing (finished and technically checked)
- 9 final Fraser Seed Audio WAV narration chapters present in remote Higgsfield cloud at `/home/user/qnova_ep004/audio/ch01.wav` ... `ch09.wav`.
- Chapter 09 first take had a confirmed repeated/spoiled TTS phrase and was REJECTED as `ch09_REJECTED_TTS_GLITCH.wav`. Re-recording accepted with coherent output, replacement voice job `10c5b9ab-4d50-4821-a1ff-a9ddfeed420b`; v2 script updated. **Never accidentally use rejected take**.
- Measured total voice 833.881s, plus eight original 2-second chapter-card transitions = **849.881s = 14m09.9s**.
- Full standardised voice master: `/home/user/qnova_ep004/audio/EP004_Fraser_Continuous_Master_850s.wav`.
- New wholly original optimistic/futuristic ambient score: `/home/user/qnova_ep004/audio/EP004_Original_Orbital_City_Optimistic_Score_850s.mp3`.
- Finished narration/music ducked loudness mastered AAC stereo: `/home/user/qnova_ep004/audio/EP004_Final_Original_Soundtrack_Mix_850s.m4a` (approx -16LUFS, peak -1.2dBFS).
- 210 final actual-voice-aligned English subtitle cues, zero overlaps: `/home/user/qnova_ep004/qa/EP004_Final_English_Captions_QA_Reviewed.srt`, verified GitHub `beyond-the-known/episodes/ep004/EP004_Final_English_Captions.srt`.

## Moving picture
- **216 unique original optimistic space-engineering visual concept candidates** at `EP004_216_Original_Futuristic_Visual_Candidates.json`.
- **174 selected unique original 5s dynamic shots** (24fps 720p 16:9) locked in `EP004-shot-queue-data.mjs`; 174 scenes + 8 animated chapter title cards = **182 segment** actual-audio-retimed timeline `EP004_V1_174_Unique_Shots_Actual_Audio_Timed.csv`.
- EP004 Netlify developer API video pipelines are running idempotently: `ep004-api-pilot-on-deploy.mjs`, `ep004-api-dispatch-full.mjs`, `ep004-api-poll-full.mjs`, `ep004-api-poll-and-archive.mjs`, all on QNova site and GitHub branch `beyond-the-known-studio`.
- Provider: `kling-video/v3.0/std/text-to-video`, original realistic 5s 720p; estimated US$0.21/video × 174 = **US$36.54**, **US$39.50** combined estimated quote safeguard. No duplicate submissions. This is a quote-based budget, not a settled charge.
- Track private results via `https://qnova-beyond-the-known.netlify.app/.netlify/functions/ep004-api-progress`; stage completes only at **174/174 both completed and archived in Netlify Blob store `btk-ep004-videos`**. At this gate 63 submitted/55 completed/52 archived, progressing automatically at max four new shots a minute. Counts will change.
- When 174 archived, adapt the previous EP003 secure export pattern: create temporary bearer-SHA256-authenticated `ep004-private-export.mjs` returning 2MB chunks of store original/`EP004_C##_B##.mp4`, never expose plain public blob URLs. Export all 174 to Higgsfield sandbox `/home/user/qnova_ep004/clips/`, inspect 1280x720/24fps/5s/source uniqueness and **delete private export function from GitHub immediately after**.
- All footage editor and integrity-check scripts ALREADY STAGED in remote Higgsfield sandbox:
  `/home/user/qnova_ep004/qa/ep004_check_originals.py`
  `/home/user/qnova_ep004/qa/ep004_build_segments.py`
  `/home/user/qnova_ep004/qa/ep004_finalize_master.sh`.
- `ep004_finalize_master.sh` is executable once 174 clips are downloaded. It validates all clips, renders **182** individual actual-timed segments, concatenates into exactly **20,397 frames**, merges the original 850s soundtrack, burns in final 210 English subtitles, exports private H.264/AAC 1280x720 full documentary and performs an end-to-end decode/black/freeze/silence check.
- Final local master target: `/home/user/qnova_ep004/EP004_First_City_In_Space_Beyond_The_Known_Private_Review_v1.mp4`. Upload using Higgsfield media_upload + sandbox_exec presigned PUT + media_confirm; probe HTTP 200 and byte-range 206. Only then send creator the full review URL and await approval.

## Thumbnails (completed, hosted)
- **Exterior giant torus above Earth**: `https://d2ol7oe51mr4n9.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/f0ee1d16-501a-4dae-bbb3-1bf7af632ccb.jpg`.
- **Interior inhabited orbital ring**: `https://d2ol7oe51mr4n9.cloudfront.net/user_3LoAgfAVzliJBEsiNPxeHklv01u/380fb804-5875-4cf3-97f6-f16d0f1e5f4d.jpg`.
- Both original, non-film-derived, professionally titled `FIRST SPACE CITY?`, 16:9; select best after film review.

## Next short (explicit follow-on intent)
**Only AFTER EP004 is complete as a private QA-verified full film**, produce the second standalone original short-format scenario and aim to schedule it for **Tuesday 10 November 2026**, Sydney AEDT, if still a future time. Preferred distinct curiosity: **What Happens When Lightning Strikes Sand?** (lightning creates natural glass/fulgurite when conditions right), striking storm-to-glass 9:16 visuals, one physical concept, 25–40 seconds, Fraser voice, captions; fact-check; release to YouTube Shorts and Facebook Reels using Metricool `type=short` and `type=REEL`, AI disclosure, automatic publication. Avoid the already-booked 7pm Facebook EP001 full video. Owner has already approved SF002 production/scheduling as follow-on but did not name its specific scenario, so this is an editorial selection, not a requested exact topic. If cannot finish before requested day, no past dates or rushed QA. Verify existing posts to prevent duplicates.

## Public channel commitments
EP001 YouTube public; FB 10 Nov 7pm. EP002 YouTube 11 Nov 4pm, FB 17 Nov noon. EP003 YouTube 13 Nov 4pm, FB 24 Nov noon. SF001 hurricane-bullet Short **PUBLISHED** YouTube `https://www.youtube.com/shorts/xVG9xhLAYiQ` and Facebook `https://facebook.com/reel/2908903189482314`. Do not change or duplicate those.
