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
- Plan: generate fresh production-preview exports and verify whatever export integrity can be
  proved locally without replacing the remaining native-app checks.
- Completed local export integrity verification: the UI-generated PDF is valid and vector-only by
  PDF structure, Quick Look renders it, and the UI-generated DOCX contains linked SVG and
  1024 x 1024 PNG fallback media.
- Plan: add a precise manual verification protocol for the remaining Phase 9 device, PWA, and
  native-export rows.
- Completed the manual verification protocol covering deployed browser checks, mobile camera,
  installed PWA behaviour, and native PDF/DOCX app checks.
- Plan: replace the stub changelog with release-ready content while leaving the `v1.0.0` tag until
  the manual matrix is complete.
- Completed the changelog preparation with the PWA, scanning, export, sharing, analytics, testing,
  and launch-budget notes needed for the eventual `v1.0.0` release.

## 2026-05-31

- Plan: orient the v2 release, confirm the v1 baseline, audit the current UI, and update the living
  project guides before implementing feature work.
- Completed v2 Phase 0 after baseline install, lint, build, and format checks passed, the current
  local and deployed UI were audited, run `26713120391` deployed successfully, and the live site
  returned HTTP 200.
- Plan: implement v2 Phase 1 by fixing narrow-width overflow, clarifying first-run camera copy,
  refining Result action hierarchy, and adding the Settings entry point needed for v2 preferences.
- Implemented the Phase 1 UX pass locally: first-run copy is clearer, narrow layouts no longer
  overflow in emulated light or dark mobile viewports, Result actions now use primary share/download
  controls plus secondary text/scan controls, and Settings is the app-bar preference entry point.
- Real mobile verification remains pending because this machine has no attached iOS or Android
  device, no `simctl`, and no `adb`; emulated mobile verification is recorded in `TESTING.md`.
- Completed v2 Phase 1 after run `26713377605` deployed successfully and the live site returned
  HTTP 200 with the updated Pages artefact timestamp.
- Plan: implement v2 Phase 2 with a pure QR type-detection registry, fixtures for every supported
  payload family, analytics mapping, and integration into the existing decode/result flow.
- Implemented the Phase 2 type registry, fixture check, analytics mapping, and Result identity
  integration; `npm run check:qr-types` now validates all required type fixtures.
- Completed v2 Phase 2 after run `26713715277` deployed successfully and the live site returned
  HTTP 200 with the updated Pages artefact timestamp.
- Plan: implement v2 Phase 3 by rendering type-aware Result fields, masking sensitive values, adding
  per-field copy affordances, and tightening the decoded-text type header.
- Implemented the Phase 3 type display locally: Result now shows an icon-led type details card,
  field copy controls, masked sensitive fields with reveal, and a decoded-text sheet with the
  detected type header and raw payload label.
- Completed v2 Phase 3 after run `26714804670` deployed successfully and the live site returned
  HTTP 200 with the updated Pages artefact timestamp.
- Plan: implement v2 Phase 4 with a shared SVG branding decorator, persisted branding preference,
  per-result override, and export support for SVG, PNG, PDF, and DOCX without embedding third-party
  trademark assets.
- Implemented the Phase 4 branding layer locally: recast QRs now render with neutral type badges by
  default, Settings persists the branding default, and the Result view can override branding for
  the current QR without changing the saved preference.
- Verified the decorated SVG path locally with `jsQR` raster decoding and a direct browser-module
  export smoke for branding-on and branding-off SVG, PNG, PDF, and DOCX.
- Completed v2 Phase 4 after run `26715366977` deployed successfully and the live site returned
  HTTP 200 with the updated Pages artefact timestamp.
- Plan: implement v2 Phase 5 by adding a versioned Batch Recast localStorage store, a clear
  single/batch mode switch, capture-to-name flow, editable/reorderable batch list, duplicate
  warning, delete undo, and restore/clear behaviours without touching shared-link loading.
- Implemented the Phase 5 Batch Recast core locally with a versioned localStorage store, scanner
  continuation mode, naming dialog, editable tray, reorder controls, duplicate warning, delete undo,
  and clear confirmation.
- Verified the Phase 5 local preview with generated QR uploads for Matter and Apple Home payloads:
  add, name, reorder, delete/undo, reload persistence, duplicate warning, and branded thumbnail
  metadata all worked without affecting `?q=` shared-link loading.
- Completed v2 Phase 5 after run `26716545553` deployed successfully and the live site returned
  HTTP 200 with the updated Pages artefact timestamp.
- Plan: implement v2 Phase 6 with a shared two-column batch sheet generator, SVG and PNG sheet
  exports, vector A4 PDF pagination, DOCX table pagination with SVG plus PNG fallback, shared
  filenames, export states, and privacy-safe `batch_exported` analytics.
- Implemented the Phase 6 batch export pipeline locally: Batch Recast can export SVG, PNG, PDF, and
  DOCX from the tray, all using the shared decorated QR sheet generator and deterministic batch
  filenames.
- Verified a seven-item browser-module export smoke: SVG produced two A4-style pages, PNG generated
  as `image/png`, PDF included the second page footer, DOCX generated as a valid ZIP-based Word
  document, and all formats shared the same `qr-recast-batch-{count}-{hash}` stem.
- Completed v2 Phase 6 after run `26716807897` deployed successfully and the live site returned
  HTTP 200 with the updated Pages artefact timestamp.
- Plan: implement v2 Phase 7 by consolidating branding, batch management, analytics opt-out, and
  About/Privacy into a tidy Settings surface with versioned preference storage.
- Implemented the Phase 7 Settings surface locally: Settings now shows Batch Recast counts, resumes
  batch capture, clears the saved batch with confirmation, keeps branding controls, and migrates
  analytics opt-out into `qr-recast:analytics:v1`.
- Verified the Phase 7 production preview at 390 px mobile width: batch resume/clear, branding
  persistence, legacy analytics opt-out migration, and horizontal overflow checks all passed.
- Completed v2 Phase 7 after run `26717220227` deployed successfully and the live site returned
  HTTP 200 with the updated Pages artefact timestamp.
- Plan: complete v2 Phase 8 by running the final automated checks, Lighthouse and bundle budgets,
  documenting remaining real-device limits, updating release docs, bumping to `v2.0.0`, tagging,
  and publishing the GitHub release.
- Plan: refine Apple Home and Matter branded QR layouts from the supplied examples, preserve setup-card
  aspect ratios through exports, bump the app version, and verify the result locally before release.
- Implemented the v2.0.1 setup-card pass locally: Apple Home now decodes and displays the
  eight-digit setup code in two lines, Matter uses the supplied full-width replica mark and dashed
  manual code below the QR, and setup-card aspect ratios are preserved in single and batch exports.
- Verified the v2.0.1 local gates: lint, build, dev-browser previews for Apple Home and Matter, and
  raster decode checks for both branded setup-card SVGs.
- Implemented final v2 hardening locally: bumped the package to `2.0.0`, deferred the PWA
  registration script, added a static first-screen fallback, and updated release documentation.
- Verified final local gates for `2.0.0`: lint, build, format check, spelling, QR type fixtures,
  Lighthouse 11.7.1 scores of 91/100/100/91/100, and a 156.25 KB gzip main bundle.
- Completed v2 Phase 8 after run `26717422541` deployed the `2.0.0` release-prep build, tag
  `v2.0.0` was pushed, and GitHub release notes were published at
  `https://github.com/tmrk/qr-recast/releases/tag/v2.0.0`.
- Plan: run a post-v2 hardening pass over the deployed UI, Batch Recast scan entry, and branded
  Matter/Apple Home setup-card exports before publishing a focused fix.
- Implemented the hardening pass locally: Batch Recast now exposes scan and upload actions inside
  the batch panel, Matter QR payloads derive a fixture-tested manual code, and branded setup payloads
  render as cleaner setup cards with a mark above the QR and a monospace identifier below it.
- Verified the hardening build with lint, spelling, QR type fixtures, format check, production build,
  390 x 844 local preview checks, and headless Chrome raster decode checks for Matter and Apple Home
  branded SVGs.

- Plan: diagnose the Matter setup-code mismatch from the supplied photo and recast screenshot, then correct the branding label so it derives the right install number.
- Analysed `IMG_3990.HEIC` and the recast screenshot: the decoded QR payload was
  `MT:OA3126F-034OCH6VQ00`, the screenshot showed `2396-352-0398`, and the printed label showed
  `2590-602-0391`.
- Corrected the Matter manual-code chunk packing and bit reader, added fixture coverage for the
  supplied payload, and verified a fresh local preview showed `25906020391` without the stale
  `23963520398` value.
- Plan: fix the Batch Recast duplicate camera entry, align the Settings controls, and add an
  in-sheet colour scheme selector.
- Implemented the UI fix locally: Batch mode now hides the single-scan status card, Settings uses
  aligned preference rows, and the colour scheme selector is available inside the Settings sheet.
- Verified the fix with lint, spelling, QR type fixtures, format check, production build, and a
  fresh local preview that confirmed one Batch camera-start action, the `data-light` theme switch,
  aligned Settings controls, and no preview console errors.
- Plan: review the Batch Recast and export fixes, remove the idle camera black surface in light
  mode, and force PDF export pages to print on white.
- Corrected the review findings locally: the camera video layer is hidden until active, invalid
  custom surface-channel CSS references now use real theme variables, and single plus batch PDF page
  fills are explicitly white.
- Verified the review fix with lint, spelling, QR type fixtures, format check, production build,
  source PDF fill checks, and a fresh 4184 preview showing light backgrounds, no Batch duplicate
  camera action, hidden idle video, and no preview console errors.
- Plan: centre the idle Batch Recast panel so it matches the Single capture screen hierarchy while
  keeping the batch tray low during active scanning.
- Implemented the Batch panel placement fix: idle batch content now uses the viewfinder centreline
  instead of the bottom slot baseline.
- Verified a fresh 4185 preview measured the Batch panel centre exactly on the viewfinder centre,
  with no duplicate camera action.
- Plan: align Settings toggle switches with a fixed control column and scoped switch dimensions.
- Implemented and verified the Settings switch alignment locally: both toggles now sit in a 72 px
  control column, the switch root centres exactly in that column, and the thumb centreline matches
  the row centreline in light and dark previews.

## 2026-06-17

- Plan: post-v2 polish — make the static HTML fallback respect dark mode and match theme colours, remove unused @types packages for strict JS-only compliance, clean stale v1.0.0 entry in ROADMAP, bump version to 2.0.2.
- Implemented the changes locally: added a style block with media query for system dark mode to the index.html fallback (matching darkTheme), removed @types/\* via uninstall, updated ROADMAP Phase 9 note, appended RECENT_CHANGES, bumped package version.
- Verified: npm run lint, npm run format:check, and npm run build all clean (bundle 156.91 KB gzip). Confirmed fallback dark colours (#0a1413) and style block present in dist/index.html. Local preview server responded with 200 and contained the updated shell.
- Completed post-v2 polish and version bump to 2.0.2.
- Pushed commit 843454f to main; GitHub Actions will deploy to Pages.
