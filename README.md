# QUANTUMNOVA

The production QUANTUMNOVA website, built with Next.js and deployed on Netlify.

## Local development

```bash
npm install
npm run dev
```

Run `npm run build` before publishing. Netlify deploys the `main` branch using
the build settings in `netlify.toml`.

## Project inquiry email

The `/api/project-inquiries` route validates each project brief and sends it to
the company inbox through Resend. Configure these values in Netlify:

- `RESEND_API_KEY`
- `PROJECT_INQUIRY_TO`, which defaults to `admin@quantumnova.com.au`
- `PROJECT_INQUIRY_FROM`, which defaults to
  `QUANTUMNOVA Website <projects@notifications.quantumnova.com.au>`

The prospective client's email address is set as the reply-to address.
