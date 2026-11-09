# Beyond the Known | QNova — Episode 003 production gate (9 November 2026)

## Approved concept
**Title:** What If Earth Suddenly Stopped Spinning?
**User direction:** more thrilling, higher-energy blockbuster-scale cinematic visuals than Episodes 001/002, but serious evidence-aware science documentary. User authorized production; no approval for public publication yet.

## Fact-check assumption
At instant t=0 the SOLID Earth loses axial rotation, while the atmosphere, oceans and unsecured matter initially retain eastward rotational momentum. Earth's ORBIT around the Sun, gravity, and axial tilt are unchanged. No actual natural mechanism would produce this clean stop. Consequences are scenario-dependent and not a forecast. Never claim the magnetic field switches off instantly, exact global winds/tsunami heights/fatalities, escape to space, or a permanently locked day-side. Sources: NASA Earth facts; NASA Goddard cosmicopia Earth rotation stop Q&A; NOAA jet stream and Coriolis effect; US Naval Observatory equation of time.

## Original script and footage
- Nine-chapter 1,496-word script: `beyond-the-known/episodes/ep003/EP003_Narration_Script_v1.md`
- 216 original scene candidates: `EP003_216_Unique_Kinetic_Shot_Candidates.json`
- Exactly **165 selected distinct cinematographic five-second source shots** across nine chapters: **[17, 16, 22, 19, 16, 18, 17, 18, 22]**.
- Selected original video API prompt queue: `EP003-shot-queue-data.mjs` (no API side effects on import)
- 173 total timeline items (165 video + 8 original chapter transitions) in `EP003_V1_165_Unique_Shots_Actual_Audio_Timed.csv`, aligned to actual 9 audio chapter durations, target **800.291332 seconds = 13m20.3s**, 24fps 1280x720.
- Compared with Episode 002: more kinetic camera direction, faster disaster montage, distinct wind/inertia/ocean scenes; quieter final survival and scientific explanation.

## Narration and sound
Nine original Fraser Seed Audio take jobs COMPLETED:
1. e618d1d2-f5aa-4513-81db-e6df3c51ba72 (83.138250s)
2. 392d3d1d-2595-4aea-a02e-8417d84d222d (74.693500s)
3. a38a9d33-c8f0-44b2-b89f-8eb5787f4597 (106.709458s)
4. 6183180e-f3d9-4c47-b653-b86e65eb8959 (88.478125s)
5. 8614f4eb-808d-468a-95f3-05a3013a8a86 (75.137208s)
6. 3321ab43-e8db-49d0-abe0-a43c75205d61 (84.938375s)
7. 613bfb20-6b31-4a5b-a120-6113cf30caf8 (80.592375s)
8. 8612df6b-a890-4d08-8248-ccf4fcec69ec (86.624708s)
9. 3d93d24b-8b2b-4fdd-b17e-cbbd304aff47 (103.979333s)
- All source files downloaded to remote Higgsfield sandbox `/home/user/qnova_ep003/audio/ch01.wav` through `ch09.wav` (NOT user laptop).
- Combined original voice WAV `EP003_Fraser_Continuous_Master_800s.wav`.
- New original synthetic orchestral/kinetic soundtrack `EP003_Original_Kinetic_Atmospheric_Score.mp3` (~800.3 seconds); layered, ducked and loudness-normalised full mix `EP003_Final_Cinematic_Soundtrack_Mix.m4a`.
- Whisper-based timed subtitles `/home/user/qnova_ep003/qa/EP003_Final_English_Captions.srt`; **194 draft caption cues, no overlaps**, stored in GitHub `EP003_English_Captions_DRAFT.srt` pending editorial final proofread.

## Developer API footage production
- QNova Netlify project `qnova-beyond-the-known`, source `QUAMTUMNOVA/quantumnova-site` / `beyond-the-known-studio`.
- QNova *funded developer API* — separate from Higgsfield website credit balance.
- Video model `kling-video/v3.0/std/text-to-video`, 5sec, 16:9, 720p, sound disabled.
- Last quoted rate: US$0.21 / 5sec; 165 originals **US$34.65 estimated**, maximum **US$40 planning safeguard** (not a provider hard payment stop).
- First 3 jobs completed and archived privately; the safe idempotent scheduled full queue is actively running at max 4 new requests per minute with no duplicate retries.
- API scripts: `ep003-api-pilot-on-deploy.mjs`, `ep003-api-poll-and-archive.mjs`, `ep003-api-dispatch-full.mjs`, `ep003-api-poll-full.mjs`.
- Verify actual up-to-date job state at read-only endpoint: https://qnova-beyond-the-known.netlify.app/.netlify/functions/ep003-api-progress
- Private Netlify Blobs stores `btk-ep003-api` for job statuses, `btk-ep003-videos` for original clips. No public media URLs or passwords exposed by progress endpoint.
- At this gate last observed 11 submitted / 3 completed / 3 archived; expected to progress automatically.
- DO NOT resubmit any request with unknown or ambiguous outcome, and never claim account balance from quote alone.

## Additional assets
Two original thumbnail backgrounds (fictional coastal disaster, Earth from orbit) generated in Higgsfield:
- `a76444c3-9f6a-4de1-8173-558ae3c7d88d`
- `1361eb5b-d8f6-42ba-b6cd-04e0159070cb`
Two 1280x720 draft cover files in remote sandbox:
`/home/user/qnova_ep003/images/EP003_coastal_city_Thumbnail_Candidate.jpg` and `EP003_orbit_Thumbnail_Candidate.jpg`.
No user audio snippets or unfinished video clips should be shown.

## Remaining gated stages
1. Confirm all 165 distinct original video API outputs completed and copied into *private* Netlify Blobs.
2. Download originals securely to Higgsfield sandbox using a short-lived authenticated export process; delete export endpoint and credential afterwards; check frame rate, source duration, source hashes and uniqueness.
3. Create 173-segment 24fps picture edit with dynamic title sequence, dramatic chapter cards, scientifically appropriate effects, no repeated scenes, and no placeholders.
4. Integrate finished 800.29s original audio mix and manually verify 194 subtitle cues; render final 1280x720 H264/AAC MP4 with burned-in captions. Run full decode/loudness/black gap/freeze QC; create and verify a private hosted review link.
5. **USER REVIEW REQUIRED:** Do not publicise, upload to public YouTube, schedule Facebook, or touch the already scheduled Episode 002 release without explicit owner approval. Episode 002 is scheduled on YouTube 11 November 4pm AEDT, Facebook 17 November midday. Episode 001 remains public and untouched.
