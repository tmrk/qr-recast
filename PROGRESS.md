# QR Recast Progress

This log is append-only. New entries go at the bottom.

## 2026-05-28

- Plan: create the Phase 0 project documents, then initialise the repository and Phase 1 skeleton.
- Implemented the Vite React skeleton, dependency set, PWA base path, linting, formatting, spelling
  check, husky hook, GitHub Pages workflow, and local preview verification.
- Verified the first deployed GitHub Pages build returned HTTP 200 at
  `https://tmrk.github.io/qr-recast/`; updating Pages action majors to avoid runtime deprecation
  annotations before marking Phase 1 complete.
- Completed Phase 1 after workflow run `26573447472` passed and the deployed placeholder returned
  HTTP 200 with the expected `/qr-recast/` manifest scope.
- Plan: build the Phase 2 foundation with MUI CSS variables theming, app shell, router, PWA
  manifest source, generated icons, and theme-colour handling.
- Implemented the Phase 2 shell locally, generated the full icon set, captured light and dark
  preview screenshots, and measured a Lighthouse 11.7.1 PWA score of 100 on local preview.
- Completed Phase 2 after workflow run `26573960339` passed and the deployed
  `https://tmrk.github.io/qr-recast/` Lighthouse 11.7.1 PWA score was 100.
- Plan: implement the Phase 3 camera viewfinder, user-gesture camera start, upload fallback,
  downscaled QR decode loop, permission states, and in-memory detection handoff.
- Implemented the Phase 3 camera viewfinder and verified local upload decoding with a generated QR
  plus fake-camera readiness in Playwright; real mobile camera verification is still pending after
  deployment.
- Verified workflow run `26575176325` deployed the Phase 3 camera build; deployed upload decoding
  and fake-camera readiness passed, while real mobile camera verification remains pending.
- Plan: complete the scan handoff by replacing the temporary detection screen with the Phase 4
  result view, canonical QR generation, and SVG, PNG, PDF, and DOCX exports.
- Implemented the Phase 4 result view, removed the temporary scan completion screen, and verified
  local preview downloads for SVG, PNG, PDF, and DOCX. Fixed DOCX generation by passing UTF-8 SVG
  bytes to `docx` with the PNG fallback intact.
- Added the Phase 3 detected-polygon overlay so successful camera scans visibly snap to the QR
  shape before handing off to the Result view.
- Completed Phase 3 and Phase 4 after workflow run `26596003511` passed and the deployed
  `https://tmrk.github.io/qr-recast/` smoke test downloaded SVG, PNG, PDF, and DOCX exports and
  copied a production share URL.

## 2026-05-29

- Plan: formalise Phase 5 compressed share URL encoding and verify the generated `?q=` link.
- Completed the compressed share URL helper, verified local preview returned HTTP 200, and confirmed
  a sample payload round-tripped through `lz-string` without exposing the plain payload in the URL.
- Plan: disable Phase 5 URL sharing when the compressed link exceeds 2000 characters and show inline
  guidance.
- Completed the URL length guard with the disabled Share URL action and inline guidance; lint, build,
  and local preview Playwright checks passed for short and long QR payloads.
- Plan: make Phase 5 URL actions use native mobile sharing when available and desktop clipboard
  copying otherwise.
- Completed the responsive URL action: desktop copies the generated `?q=` URL, while mobile-style
  browsers with Web Share available use native sharing.
- Plan: add the Phase 5 desktop copied URL pill and secondary QR preview after successful URL
  copying.
- Completed the desktop copied URL pill and secondary share-link QR preview; local preview verified
  it appears only after desktop copying and stays hidden on the mobile native-share path.
- Plan: add the Phase 5 copied-state icon morph, success colour, and subtle scale animation to the
  URL copy action.
- Completed the URL copy feedback with a check icon morph, success button colour, and subtle scale
  animation; local preview verified the copied state and mobile native-share separation.
- Plan: load valid Phase 5 `?q=` payloads directly into the Result view and replace the URL without
  the query string.
- Completed direct `?q=` loading: valid shared URLs open the Result view and clear the query string,
  while invalid payloads clear back to the scanner.
- Plan: make the decoded text panel open as a mobile bottom sheet while keeping the desktop dialog.
- Completed the responsive decoded text container; local preview verified the desktop dialog and
  mobile bottom sheet both show the decoded payload.
- Plan: tighten the decoded payload code block so long content scrolls inside the monospace panel.
- Completed the decoded payload code block scrolling pass; local preview verified long content
  scrolls inside the monospace `pre`/`code` panel.
- Plan: detect common decoded payload kinds and display the kind in the decoded text panel.
- Completed payload kind detection and display; local preview verified URL, plain text, and Wi-Fi
  payload chips in the decoded text panel.
- Plan: add a decoded-panel external-link affordance for HTTP and HTTPS URL payloads.
- Completed the URL payload external-link affordance; local preview verified it appears for URL
  payloads, stays hidden for plain text, and renders inside the mobile bottom sheet.
- Plan: add decoded text copying with the same check icon, success colour, and scale feedback as URL
  copying.
- Completed decoded text copy feedback; local preview verified clipboard output, the matching
  success animation, and the mobile bottom-sheet affordance.
- Plan: add the Phase 7 advertisement placeholder slot behind `VITE_ADS_ENABLED`.
- Completed the advertisement placeholder slot behind `VITE_ADS_ENABLED`; local preview verified the
  slot is absent by default and appears when the flag is true.
- Plan: document the planned AdSense wiring while keeping the owned ads TODO on the roadmap.
- Completed the AdSense wiring notes in `DEPLOYMENT.md` and kept `TODO(ads)` open in the deferred
  roadmap section.
- Plan: add runtime GA4 script injection behind `VITE_GA_MEASUREMENT_ID`.
- Completed runtime GA4 injection behind `VITE_GA_MEASUREMENT_ID`; local preview verified GA is
  absent by default and injected when a test measurement ID is set.
- Plan: verify the committed environment example and local secret ignore rules for Phase 7.
- Completed the environment-file audit: `.env.example` is tracked, while `.env`, `.env.local`, and
  `.env.production` are ignored by `.gitignore`.
- Plan: add privacy-safe analytics events for scans, exports, sharing, and text actions without QR
  payload content.
- Completed privacy-safe analytics events through a whitelisted wrapper; local GA preview verified
  scan, shared-link, decoded-text, share URL, and SVG export events without QR payload fragments.
- Plan: respect browser Do Not Track and add an About sheet with a one-click analytics opt-out.
- Completed DNT and analytics opt-out support; local previews verified About sheet layout, default
  GA-off behaviour, DNT blocking, stored opt-out blocking, and one-click opt-out persistence.
- Plan: add a subtle Phase 8 page transition between the Viewfinder and Result states.
- Completed the scanner/result page transition; local preview verified upload-to-result and
  scan-again paths both use the transition wrapper.
- Plan: add the QR capture moment animation and use View Transitions when available.
- Completed the capture moment animation; local preview verified the flash layer, View Transition
  handoff, and CSS fallback when the API is unavailable.
- Plan: add long-press QR image copying with a desktop tooltip affordance.
- Completed long-press QR PNG copying; local preview verified touch press-and-hold copy feedback and
  the desktop hover tooltip.
- Plan: verify dark mode parity across scanner, Result, decoded text, and About surfaces.
- Completed the dark mode parity pass with local preview screenshots for scanner, Result, decoded
  text bottom sheet, and About sheet.
- Plan: complete the Phase 8 accessibility pass for keyboard, ARIA, focus, live regions, and
  contrast.
- Completed the accessibility pass: axe is clean in light and dark mode across scanner, About,
  Result, and decoded text surfaces, and keyboard QR copy plus Escape close were verified.
- Plan: finish the About sheet with a build hash while keeping version, privacy, and licence
  details visible.
- Completed the About sheet metadata pass; local preview verified version, test build hash, privacy
  note, and MIT licence link, and the Pages workflow now supplies `VITE_BUILD_SHA`.
- Plan: add a static GitHub Pages 404 page that redirects gracefully to the app root.
- Completed the static 404 redirect page and removed the copied-index fallback; local preview
  verified `/qr-recast/404.html` redirects to `/qr-recast/`.
- Plan: advance the Phase 9 cross-device matrix with automated Chromium, Firefox, WebKit, and QR
  variant coverage while keeping real-device rows separate.
- Completed automated Phase 9 matrix coverage: actual Google Chrome plus Playwright Chromium,
  Firefox, and WebKit upload/decode smokes passed, and every QR variant matrix row was verified.
- Completed automated mobile-shaped coverage for iOS Safari latest and previous emulation, Android
  Chrome emulation, and Android Firefox emulation.
- Completed automatable PWA matrix checks: offline reload after first load, status bar and
  splash-capable manifest metadata, icon sizes, and safe-area inset coverage.
- Plan: verify the Phase 9 Lighthouse and bundle-size launch budgets on a fresh production preview.
- Completed the Phase 9 launch budgets: local preview Lighthouse scores were 96 Performance,
  100 Accessibility, 100 Best Practices, 91 SEO, and 100 PWA, and the main bundle was 157.12 KB
  gzip.
