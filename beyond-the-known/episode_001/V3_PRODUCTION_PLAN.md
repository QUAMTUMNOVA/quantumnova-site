# Beyond the Known — Episode 001: V3 cinematic rebuild

**Objective.** Produce an engaging, realistic documentary from the locked Fraser narration, not a slide show. This is the complete Option C workflow: (1) narration-derived visual beat sheet, (2) missing-footage generation plan, (3) editorial rebuilding strategy.

## Source of truth
- `v3_narration_beat_sheet.json`: 115 original editorial intents across all nine audio sections
- `v3_timed_beat_sheet.json`: those 115 beats aligned approximately to the **1,305 words** actually spoken by Fraser
- `dispatch-v3-api.mjs`: 12 narration-specific new video generation shots through QNova's prepaid developer API, two at a time with once-only submission reservations, US$18 planning threshold
- `poll-v3-api.mjs`: read-only job status updates; no paid resubmission
- `v3_additional_footage_backlog.json`: 27 carefully scoped next-pass video needs, **not automatically billed**

## Editing approach
1. **Lock narration** and soundtrack; preserve actual timing. Do not use chapter placeholders as timestamp truth. Re-transcription is approximate and human semantic QC is still mandatory.
2. **Match each narrated clause to a literal moving scene.** Only employ non-literal atmospheric visuals as intentional bridges. Do not substitute generic empty streets for infrastructure explanation or mix future forest shots into first-day scenes.
3. **Reject weak footage** regardless of sunk generation costs. Identify model errors (impossible physics, morphing vehicles, fake text or impossible structures), blurry/low-detail frames, mismatch to line, wrong era, excessive similarity.
4. **Premise hook (first 45 seconds)**: begin with the coffee cup and real-world action before title typography. A bus, driverless traffic, empty cockpit and consequences follow in narrator order.
5. **Transitions**: use motivated clean cuts by default, preserve spatial/motion continuity, use restrained short sound-image J/L overlaps. Dissolves reserved for long time changes; never automated dissolve on every cut. No black chapter screens.
6. **Shot duration**: most 3–7 seconds, but dictated by action, speech and composition; do not speed-warp a 5s clip to cover 20s; avoid identical footage within 35s.
7. **Chapter shape**: immediate disappearance dense and urgent; electricity/water explanatory; animals observational; years/centuries slower and spatially clear; millennium awe with grounded materials.
8. **Polish**: restrained motion graphics for timelines and geographic comparison, titles over moving footage, technical diagrams where footage cannot explain a process. Music must sit below the narrator, with intentional dips under important lines.
9. **QC**: missing visual beats, mismatched narration, repeated footage, frame jumps, black frames, frozen shots, weak opening, clipped narrator, audio balance and abrupt transitions. Fail the cut if the opening doesn't show narrated action.
10. **Approval**: a review MP4 must be delivered and explicitly approved before YouTube release. Production jobs do not automatically publish.

## Budget and generation strategy
- **Billing order:** genuinely relevant free plugin generations, then funded QNova API; no more paid video through the creator/plugin credits while API money remains.
- **First V3 batch:** 12 × 5-second WAN 3.0 documentary scenes; provisional ceiling US$18.00. Not a provider-enforced billing cap.
- **Next-pass shot bank:** 27 candidates × planning estimate US$1.50 = US$40.50. **Queue not activated until first batch is reviewed and the current API wallet balance is confirmed**. If budget or quality differs, trim/reprioritise before paying.
- Existing footage is a **candidate pool**, not an obligation.
- 720p initial renders are editorial candidates, not a promise of premium 1080p deliverable. Final output resolution and selective re-generation need quality approval.

## Automated stages
1. Read audio and spoken-word alignment.
2. Resolve beat intents and missing media.
3. Generate new V3 shots with idempotent paid API submission.
4. Poll once-per-job status and securely import completed media.
5. Rank candidate shots, annotate rejection reasons, and assemble to actual narration word ranges.
6. Run objective technical QA and inspect representative shots for scene fidelity.
7. Export V3 review film, compare the 0:00–1:00 hook to V2, and ask for approval.
8. Keep YouTube release **disabled** unless explicitly authorised.
