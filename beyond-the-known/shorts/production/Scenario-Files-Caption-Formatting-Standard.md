# QNova Scenario Files — Caption Formatting Standard (effective SF004 onward)

## User-visible defect to prevent
User reported stray `/` or `\` glyphs at the end of subtitle lines in earlier Shorts. Root cause was manual ASS subtitle hard breaks being double-escaped and/or passed through an extra backslash-escaping routine, displaying a literal slash/backslash rather than starting a new caption line.

## Mandatory permanent rule
**DO NOT inject any manual ASS hard line-break string `\\N` or `\\n` into a spoken caption.** Rely on libass line wrapping (WrapStyle 0) with the intended margins and font size instead. User does not want stray slash glyphs.

- Use original serious Fraser voice; derive SRT/ASS timing from the exact finished audio with word timestamps.
- Group phrases naturally in ≤5 words and up to ~1.7 seconds, allow renderer to wrap automatically.
- Text cleanup removes any stray backslash or slash inserted by escaped newlines, also fixes hyphenated phrases.
- Use a caption style with 720×1280 `PlayResX/PlayResY`, font size ~48, white with strong dark outline, `MarginL:62`, `MarginR:62`, `MarginV:260`. This leaves room for Shorts UI overlays.
- Do **not** place a subtitle line too close to the lower edge. Caption text must not be covered by Shorts/Reels interface.
- For multi-line opening and outro branding, write **separate dialogue events per line** with a proper `{\\pos(x,y)}` override; never concatenate titles with hard linebreaks in one event.
- If a real scientific fraction would be displayed in a subtitle, spell it naturally in narration (e.g. "one-sixth") rather than arbitrary slash shorthand.
- Never create a literal visible slash/backslash as a formatting instruction.

## Required automated checks BEFORE uploading/scheduling
1. For EVERY `Dialogue:` subtitle event, remove recognised override formatting `{...}`, then assert visible text has no backslash and no forced hard linebreak, and no stray `/` at line ends.
2. Ensure cue start is before cue end, no cue exceeds finished master duration, and no accidental cue overlap.
3. Render stills from multiple points of the **final MP4** (intro, first caption, mid-film, last caption and outro); inspect for unwanted slash glyphs and UI clipping.
4. Full-file FFmpeg decode QA. Verify exact 9:16 aspect, nominal 24fps, H264/AAC, voice track, original music and stable frame count.
5. NEVER schedule the YouTube Short/Facebook Reel without both completed finished video and attached cover. Before posting re-query Metricool date window to avoid duplicate bookings. Check after creating posts that `autoPublish=true`, correct `youtubeData.type=short` / `facebookData.type=REEL`, media attached, source video quality.
6. The fix is forward-looking: do not silently alter already-published SF001, SF002 or SF003.

## Verified clean-caption reference implementations
SF004: remote temporary creative production sandbox `/home/user/qnova_shorts/sf004/qa/build_clean_ass_captions.py`; 22 timed cues, 33 seconds, title as separate ASS events, no `\\N` hard breaks. Final QA GitHub `beyond-the-known/shorts/scenario-files/sf004/SF004_Final_QA_and_Release_2026-11-09.md`.

SF005: `/home/user/qnova_shorts/sf005/qa/build_clean_ass_captions.py`; 24 timed cues, 36 seconds, no `\\N` hard breaks. Final QA `beyond-the-known/shorts/scenario-files/sf005/SF005_Final_QA_and_Release_2026-11-09.md`.

For SF006 onward use this standard and preferably a generalised version of SF005's proven no-forced-break caption writer.


## Platform-specific audience call to action (owner instruction, 9 November 2026)

Owner expressly wants viewers asked to subscribe on YouTube and like/follow on Facebook, without interrupting science or documentary storytelling. **Implement on ALL FUTURE QNova originals**:

- Every YouTube Short uses a 2–3 second branded outro/overlay: **SUBSCRIBE FOR MORE** and **BEYOND THE KNOWN**; YouTube long videos use a 3–5 second outro: **SUBSCRIBE TO BEYOND THE KNOWN**. Keep normal production audio/visual continuity, avoid mid-narration interruptions, encourage by relevant intrigue rather than generic begging.
- Every Facebook Reel uses **LIKE & FOLLOW FOR MORE** with **BEYOND THE KNOWN**; Facebook long video: **LIKE & FOLLOW BEYOND THE KNOWN**. These messages are CTA variants of the SAME source video and soundtrack, requiring no additional generated footage or duplicated image/video API calls.
- Deliver **two distinct fully rendered video files per episode** for correct platform CTA rather than two platforms displaying inappropriate instructions; allow posting descriptions to also encourage relevant channel action.
- Use legible center-safely positioned text, mindful of YouTube Shorts and Facebook Reels UI overlays; no obstructing primary subject or key final narration line. 2–3 seconds is enough for Shorts. Long form may include gentle short spoken CTA only if it doesn't bloat running time.
- Avoid platform logos and any misleading 'Subscribe' buttons without real buttons. Do not put literal slash/backslash/hardline \\N in captions. Use dedicated separate ASS End events and per-platform still graphics if needed.
- When preparing and confirming Metricool uploads, verify **the appropriate platform-specific video file URL** is attached (not just the same generic master). Check complete video playback QA for BOTH master variants. If existing video is already published or scheduled, don't replace blindly; apply to future videos from SF010, SF011 and EP007 onwards.
- Keep the real story and mystery compelling; CTA is a quiet final beat, not a mid-video interruption or long outro that hurts retention.
