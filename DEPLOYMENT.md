# Deployment

QR Recast deploys to GitHub Pages at:

```text
https://tmrk.github.io/qr-recast/
```

## GitHub Pages

- The Vite base path must be `/qr-recast/`.
- The React router basename must be `/qr-recast`.
- GitHub Pages uses GitHub Actions as its source.
- The PWA manifest source lives at `public/manifest.webmanifest` and is loaded by
  `vite-plugin-pwa` during the build.
- The deployment workflow builds `dist/`, copies `dist/index.html` to `dist/404.html` for SPA
  fallback, uploads the Pages artefact, and deploys it.

Pages was enabled on 2026-05-28 with:

```sh
gh api repos/tmrk/qr-recast/pages -X POST -f build_type=workflow
```

## Environment Variables

Committed defaults live in `.env.example`:

```sh
VITE_GA_MEASUREMENT_ID=
VITE_ADS_ENABLED=false
VITE_ADSENSE_CLIENT=
```

Local values live in `.env.local`, which is gitignored. Production values are configured as GitHub
Actions repository secrets and passed into the build step.

## Analytics Events

GA4 loads only when `VITE_GA_MEASUREMENT_ID` is set. Event tracking is routed through
`src/features/analytics/events.js`, which accepts only fixed event names and whitelisted metadata
values.

Current events cover QR detection, shared URL loading, QR export, URL sharing, decoded-text viewing,
decoded-text copying, external payload-link opening, and scan-again actions. The metadata is limited
to values such as payload kind, source, export format, method, result, and surface.

QR payload text, generated share URLs, hashes, filenames, image data, and exported document content
must not be passed to analytics.

## Planned AdSense Wiring

The committed app only renders the local placeholder from `src/features/ads/AdSlot.jsx` when
`VITE_ADS_ENABLED=true`. The production AdSense integration will stay off until an AdSense account
and client ID are available.

When that is ready:

- Set `VITE_ADS_ENABLED=true` for the Pages build.
- Set `VITE_ADSENSE_CLIENT` to the assigned `ca-pub-...` client ID.
- Replace the placeholder strip with the AdSense `ins` tag and script loader.
- Keep the ad component free of QR payload data; no decoded text, image content, or export metadata
  is passed to ad code.

The owned follow-up remains tracked in `ROADMAP.md` as `TODO(ads)`.

## Manual Fallback

If Pages is not yet enabled, set the repository Pages source to GitHub Actions:

```sh
gh api repos/tmrk/qr-recast/pages -X POST -f build_type=workflow
```

If that endpoint reports that Pages already exists, confirm the current configuration:

```sh
gh api repos/tmrk/qr-recast/pages
```
