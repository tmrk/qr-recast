# Recent Changes

Newest entries stay at the top. Keep roughly the last 20 meaningful changes here; older entries
move into `CHANGELOG.md`.

- 2026-05-29: Added the manual browser, PWA, camera, and native-export verification protocol.
- 2026-05-29: Added local export integrity evidence for UI-generated PDF and DOCX files.
- 2026-05-29: Verified Lighthouse launch budgets and the 157.12 KB gzip main bundle budget.
- 2026-05-29: Verified automatable PWA matrix checks for offline reload, metadata, icons, and
  safe-area coverage.
- 2026-05-29: Added automated mobile-shaped coverage for iOS Safari and Android browser matrix
  rows.
- 2026-05-29: Added Phase 9 automated browser-engine and QR variant matrix coverage.
- 2026-05-29: Added a static 404 page that redirects back to the app root.
- 2026-05-29: Completed the About sheet with version, build hash, privacy note, and MIT licence link.
- 2026-05-29: Completed the accessibility pass for ARIA, live regions, keyboard QR copy, and
  light/dark contrast checks.
- 2026-05-29: Verified dark mode parity across scanner, Result, decoded text, and About surfaces.
- 2026-05-29: Added long-press QR PNG copying with a desktop tooltip affordance.
- 2026-05-29: Added the QR capture flash with a View Transitions API handoff and CSS fallback.
- 2026-05-29: Added a subtle page transition between the Viewfinder and Result states.
- 2026-05-29: Added an About sheet with Do Not Track support and a persisted analytics opt-out.
- 2026-05-29: Added privacy-safe analytics events with whitelisted metadata only.
- 2026-05-29: Verified the tracked `.env.example` and gitignored local environment files.
- 2026-05-29: Added runtime GA4 injection behind `VITE_GA_MEASUREMENT_ID`.
- 2026-05-29: Documented planned AdSense wiring while keeping the owned ads TODO on the roadmap.
- 2026-05-29: Added the Phase 7 advertisement placeholder slot behind `VITE_ADS_ENABLED`.
- 2026-05-29: Completed Phase 6 with decoded text copying and matching copied-state feedback.
- 2026-05-29: Added an `Open link` affordance for decoded URL payloads.
- 2026-05-29: Added decoded payload kind detection and displayed it in the decoded text panel.
- 2026-05-29: Tightened decoded payload code-block scrolling for long content.
- 2026-05-29: Started Phase 6 with a decoded text bottom sheet on mobile and a dialog on desktop.
- 2026-05-29: Completed Phase 5 direct shared-link loading from `?q=` with query-string clearing.
- 2026-05-29: Added copied-state feedback to the URL action with a check icon morph, success colour,
  and subtle scale animation.
- 2026-05-29: Added the desktop copied URL pill with a secondary QR preview for the generated
  share link.
- 2026-05-29: Made the Phase 5 URL action share natively on mobile-style browsers and copy the
  generated link on desktop.
- 2026-05-29: Disabled URL sharing when compressed links exceed 2000 characters and added inline
  guidance on the Result view.
- 2026-05-29: Formalised Phase 5 compressed share URLs with explicit `lz-string` `?q=` encoding
  and local preview verification.
- 2026-05-28: Completed Phase 3 and Phase 4 with a green GitHub Pages deployment and live export
  smoke test.
- 2026-05-28: Added detected-polygon confirmation over the camera viewfinder before result handoff.
- 2026-05-28: Replaced the temporary scan completion screen with the Phase 4 result view, canonical
  QR generation, and local SVG, PNG, PDF, DOCX, share URL, and decoded-text verification.
- 2026-05-28: Implemented the Phase 3 camera viewfinder with user-gesture camera start, upload
  fallback, downscaled QR decoding, permission states, haptic detection handoff, and stream cleanup.
- 2026-05-28: Completed Phase 2 with a deployed PWA shell scoring 100 in the Lighthouse 11.7.1 PWA
  category.
- 2026-05-28: Added the Phase 2 MUI CSS-variable theme foundation, app shell, router, manifest
  source, generated PWA icons, and dynamic theme-colour handling.
- 2026-05-28: Completed Phase 1 with a green GitHub Pages workflow and a live placeholder at
  `https://tmrk.github.io/qr-recast/`.
- 2026-05-28: Added the Phase 1 Vite React skeleton, dependency stack, PWA manifest wiring,
  linting, formatting, spelling checks, husky hook, GitHub Pages workflow, and Pages source
  configuration.
- 2026-05-28: Created the Phase 0 project documents that define the agent contract, roadmap,
  architecture notes, deployment notes, testing plan, contribution guide, progress log, and
  changelog.
