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
- 2026-05-28: Verified deployed `https://tmrk.github.io/qr-recast/` returned HTTP 200 after
  workflow run `26573447472`.
- 2026-05-28: Captured Phase 2 mobile light, desktop light, and mobile dark Playwright screenshots
  from `http://127.0.0.1:4174/qr-recast/`.
- 2026-05-28: Lighthouse 11.7.1 PWA score on local preview was 100.
- 2026-05-28: Lighthouse 11.7.1 PWA score on deployed
  `https://tmrk.github.io/qr-recast/` was 100 after workflow run `26573960339`.
- 2026-05-28: Phase 3 local preview fake-camera smoke test reached "Point at a QR code" after
  tapping "Start camera".
- 2026-05-28: Phase 3 local preview upload fallback decoded a generated QR payload:
  `https://tmrk.github.io/qr-recast/test-payload`.
- 2026-05-28: Phase 3 deployed upload fallback decoded the same generated QR payload at
  `https://tmrk.github.io/qr-recast/`.
- 2026-05-28: Phase 3 deployed fake-camera smoke test reached "Point at a QR code" after tapping
  "Start camera".
- 2026-05-28: User confirmed on a real mobile device that the deployed Phase 3 camera opens, scans,
  and detects a QR payload.
- 2026-05-28: Phase 4 local preview upload fallback handed the generated QR payload to the Result
  view instead of the temporary scan completion screen.
- 2026-05-28: Phase 4 local preview generated downloads for SVG, PNG, PDF, and DOCX from the same
  payload. Sizes were 1,927 bytes, 27,150 bytes, 9,340 bytes, and 25,152 bytes respectively.
- 2026-05-28: Phase 4 local preview copied a compressed share URL containing `?q=` and opened the
  decoded-text dialog for the generated QR payload.
- 2026-05-28: Phase 3 polygon overlay build passed lint and build; local upload-to-result
  regression still reached the rendered QR.
- 2026-05-28: Phase 4 deployed smoke test at `https://tmrk.github.io/qr-recast/` generated SVG,
  PNG, PDF, and DOCX downloads and copied a production share URL after workflow run `26596003511`.
- 2026-05-29: Phase 5 local preview verified a short QR payload kept Share URL enabled and a
  1,400-character QR-safe payload generated a 2,103-character share URL that disabled Share URL with
  inline guidance.
- 2026-05-29: Phase 5 local preview verified desktop `Copy URL` copied the generated `?q=` link and
  a mobile-style browser with Web Share available used the native `Share URL` path.
- 2026-05-29: Phase 5 local preview verified the desktop copied URL pill and secondary share-link
  QR appear only after copying and stay hidden on the mobile native-share path.
- 2026-05-29: Phase 5 local preview verified URL copy feedback morphs to a check icon, settles on
  the success colour, runs the scale animation, and stays separate from mobile native sharing.
- 2026-05-29: Phase 5 local preview verified a valid compressed `?q=` payload opens the Result view,
  clears the query string, and exposes the decoded payload; invalid `?q=` clears to the scanner.
- 2026-05-29: Phase 6 local preview verified decoded text opens in a desktop dialog and in a
  mobile bottom sheet with the same payload content.
- 2026-05-29: Phase 6 local preview verified long decoded text scrolls inside a monospace
  `pre`/`code` block with preserved wrapping.
- 2026-05-29: Phase 6 local preview verified decoded payload kind chips for URL, plain text, and
  Wi-Fi payloads.
- 2026-05-29: Phase 6 local preview verified URL payloads show an `Open link` affordance with
  `_blank` and `noopener`, plain text hides it, and mobile shows it inside the bottom sheet.
- 2026-05-29: Phase 6 local preview verified decoded text copying writes the payload to the
  clipboard, uses matching success feedback, and is present in the mobile bottom sheet.
- 2026-05-29: Phase 7 local preview verified the advertisement slot is absent by default and appears
  in the shell bottom slot when built with `VITE_ADS_ENABLED=true`.
- [x] Phase 3 real mobile camera verification at `https://tmrk.github.io/qr-recast/`.

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

- [x] SVG downloads from local preview.
- [x] PNG downloads from local preview at 1024 x 1024.
- [x] PDF downloads from local preview through the vector exporter.
- [x] DOCX downloads from local preview with SVG data and PNG fallback.
- [ ] PDF opens in Preview and Acrobat as vector artwork.
- [ ] DOCX opens in Microsoft Word with SVG and PNG fallback intact.

## Launch Budgets

- [ ] Lighthouse Performance at least 90.
- [ ] Lighthouse Accessibility at least 95.
- [ ] Lighthouse Best Practices at least 95.
- [ ] Lighthouse SEO at least 90.
- [ ] Lighthouse PWA installability confirmed.
- [ ] Main bundle at or below 250 KB gzipped.
