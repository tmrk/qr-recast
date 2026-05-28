# Deployment

QR Recast deploys to GitHub Pages at:

```text
https://tmrk.github.io/qr-recast/
```

## GitHub Pages

- The Vite base path must be `/qr-recast/`.
- The React router basename must be `/qr-recast`.
- GitHub Pages uses GitHub Actions as its source.
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

## Manual Fallback

If Pages is not yet enabled, set the repository Pages source to GitHub Actions:

```sh
gh api repos/tmrk/qr-recast/pages -X POST -f build_type=workflow
```

If that endpoint reports that Pages already exists, confirm the current configuration:

```sh
gh api repos/tmrk/qr-recast/pages
```
