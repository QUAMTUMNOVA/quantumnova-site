# Beyond the Known — QNova Production Studio

Dedicated site: https://qnova-beyond-the-known.netlify.app
Netlify site ID: a31be4b6-9c59-47d9-b387-3cf0ab9a72b1
QNova GitHub source: QUAMTUMNOVA/quantumnova-site, branch `beyond-the-known-studio`, base directory `beyond-the-known`.
Never deploy this branch to the original `quantumnova.com.au` site or to ETS.

## Current status (8 November 2026)
- The funded Higgsfield API account was authenticated using a read-only call (HTTP 200); key is held only in a Netlify environment secret named `HF_KEY`, scoped to Functions.
- A one-time 3-shot Episode 001 test was submitted on Netlify's successful deployment event, with conservative US$5 planned charge ceiling and no retry on uncertain responses.
- Three requests finished: Wan 3.0 Manhattan 5s, Marketing Studio Image airplane still, Kling 3.0 control-room 5s.
- Test assets were reviewed and combined into a 17-second silent visual preview. This is **not** the final documentary.
- A scheduled read-only polling function checks submitted jobs every 10 minutes.
- Publication remains disabled; final YouTube release always requires explicit owner approval.

## Runtime functions
- `health.mjs`: Read-only liveness and credential-presence check. It never sends the API key to visitors.
- `public-status.mjs`: Public read-only safe summary of job states; exposes no API job IDs or media URLs.
- `dispatch-on-deploy.mjs`: Platform-event-only one-time 3-shot generation; no public route and no repeat submissions.
- `poll-on-schedule.mjs`: Scheduled status updates to Netlify Blobs; no new generation.
- `review-assets.mjs`: Read-only preview of raw job IDs and asset URLs, protected by a high-entropy bearer capability token. Only a SHA-256 hash is in source control; the token itself is not committed.
- `verify-higgsfield.mjs`: Temporary low-rate-limit read-only API authentication test. Remove once no longer needed.

## Storage and safety
Netlify Blobs store `btk-production-ep001` contains the run lock and individual shot status records.

**No API credential or review token is committed to source.** Credential scopes must stay Functions-only. Never put `HF_KEY` in the browser or a Git commit. Site visitors cannot trigger paid generation or publication.

The first trial uses only:
- Wan 3.0 text-to-video, duration 5 seconds, 720p, sound disabled
- Marketing Studio Image, 1K, low-quality still, no prompt enhancement
- Kling 3.0 Standard text-to-video, duration 5 seconds, sound disabled

The US$5 ceiling is a *conservative planning maximum based on documentation*, not a provider-backed account spending stop; the API did not provide a live transaction quote. The actual charge must be reconciled against billing.

If any submit attempt returns an ambiguous outcome, the worker stops permanently rather than retrying. For a new full-episode batch, implement a separate approval, budget and idempotency record. **Never re-enable or reset the existing one-time batch lock.**

## Next development
1. Final factual review of the full Episode 001 script and source references.
2. Select and produce a consistent, properly licensed narrator voice.
3. Add a server-side queue for the full shot manifest, resilient media ingest and cost accounting.
4. Render a full episode with automatic captions, loudness check and quality-control report.
5. Provide an authenticated owner-review workflow with explicit `approved_for_youtube` gate and private upload first.

No new paid generation should be run as a result of ordinary deployments; only the one-time locked pilot batch is implemented.
