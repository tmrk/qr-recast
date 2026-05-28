# Testing

## Automated Checks

- `npm run lint`
- `npm run build`
- `npm run format:check`
- `npm run check:spelling`

## Local Preview Checks

- 2026-05-28: Verified `http://127.0.0.1:4173/qr-recast/` returns HTTP 200.
- 2026-05-28: Verified built asset URLs and manifest links include the `/qr-recast/` base path.
- 2026-05-28: Captured mobile `390 x 844` and desktop `1280 x 900` Playwright screenshots from
  the preview server.

## Manual Browser Matrix

- [ ] iOS Safari latest
- [ ] iOS Safari previous major version
- [ ] iOS installed PWA
- [ ] Android Chrome
- [ ] Android Firefox
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Desktop Firefox

## QR Variant Matrix

- [ ] Short plain text
- [ ] Long plain text
- [ ] URL
- [ ] Wi-Fi payload
- [ ] vCard
- [ ] Low contrast QR
- [ ] Slightly rotated QR
- [ ] Partially occluded QR, failing gracefully

## PWA Checks

- [ ] Installable on iOS.
- [ ] Installable on Android.
- [ ] Offline-capable after first load.
- [ ] Correct splash screen and status bar colour.
- [ ] Safe-area insets respected.

## Export Checks

- [ ] SVG opens as crisp vector.
- [ ] PNG exports at 1024 x 1024.
- [ ] PDF opens in Preview and Acrobat as vector artwork.
- [ ] DOCX opens in Microsoft Word with SVG and PNG fallback intact.

## Launch Budgets

- [ ] Lighthouse Performance at least 90.
- [ ] Lighthouse Accessibility at least 95.
- [ ] Lighthouse Best Practices at least 95.
- [ ] Lighthouse SEO at least 90.
- [ ] Lighthouse PWA installability confirmed.
- [ ] Main bundle at or below 250 KB gzipped.
