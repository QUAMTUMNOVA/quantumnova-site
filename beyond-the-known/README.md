# Beyond the Known — QNova isolated Netlify deployment

This is a read-only production scaffold for the 11–12 minute pilot `What If Every Human Disappeared Tomorrow?`. It never submits paid generations or publishes to YouTube.

**Deployment source:** This code is isolated on GitHub branch `beyond-the-known-studio` of `QUAMTUMNOVA/quantumnova-site`. The production branch `main` is unchanged.

**Netlify project:** `qnova-beyond-the-known` under QNova's team (site ID a31be4b6-9c59-47d9-b387-3cf0ab9a72b1).

To connect the existing empty Netlify project:
- In the project's **Deploys / Continuous deployment** settings, connect the GitHub repository `QUAMTUMNOVA/quantumnova-site`.
- Select the deploy branch `beyond-the-known-studio`, **not main**.
- Set **Base directory** to `beyond-the-known` (no leading slash), with **Publish directory** `public`. The folder's `netlify.toml` configures Functions.
- Review settings before saving; the existing QNova website uses the repo's `main` branch and should not be changed.
- Trigger first deploy and check `/.netlify/functions/health`.

The Netlify environment variable `HF_KEY` has already been configured by the owner as a **secret** with Functions access. Never read it into the client, paste it into chat, or commit it to GitHub. The health function checks presence only; it does not validate Higgsfield authentication.

**Current release limitations:**
- Static operational overview is public if the Netlify site is public. It contains no sensitive data and is tagged noindex.
- No admin write endpoints and no public generation triggers are exposed.
- Direct funded Higgsfield API integration, credential validation, queue workers, protected review, persistent media storage, and YouTube publishing are not implemented in this scaffold.
- Owner approval must be explicitly obtained after reviewing the final render; no automated release.

Full pilot production files are in a separate local package `Beyond_the_Known_Production_Starter.zip`, already delivered in conversation. Do not commit credentials, production billing logs or API job ledger to this public repository.
