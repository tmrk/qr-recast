# QR Recast Roadmap

Tick items only after the Definition of Done in `AGENTS.md` is met.

## Phase 0 — Agentic Environment Setup

- [x] Create `AGENTS.md`.
- [x] Create `ROADMAP.md`.
- [x] Create `PROGRESS.md`.
- [x] Create `RECENT_CHANGES.md`.
- [x] Create `ARCHITECTURE.md`.
- [x] Create `DEPLOYMENT.md`.
- [x] Create `TESTING.md`.
- [x] Create `CONTRIBUTING.md`.
- [x] Create `CHANGELOG.md`.

## Phase 1 — Repo, Tooling, Deploy Pipeline

- [x] Initialise git if needed, create the GitHub repo, and configure `origin`.
- [x] Scaffold Vite and React with the JavaScript template.
- [x] Configure `vite.config.js` with `/qr-recast/` base path and `vite-plugin-pwa`.
- [x] Install runtime dependencies: MUI, Emotion, MUI icons, Roboto Flex, router, QR decoding and
      export libraries, file saving, and URL compression.
- [x] Install development dependencies: eslint, React and accessibility plugins, prettier,
      eslint-config-prettier, PWA tooling, husky, and lint-staged.
- [x] Configure eslint with React, hooks, accessibility rules, and CI spelling checks.
- [x] Configure prettier with 2-space indent, single quotes, semicolons, trailing commas, and
      100-column print width.
- [x] Configure husky pre-commit so lint-staged runs prettier and eslint on staged files.
- [x] Add GitHub Actions deployment for pushes to `main`, including Pages artefact upload and SPA
      fallback.
- [x] Enable GitHub Pages with GitHub Actions as the source and document any manual fallback.
- [x] Commit, push, wait for a green workflow, and verify the placeholder page at
      `https://tmrk.github.io/qr-recast/`.

## Phase 2 — Foundation: Theme, Layout, PWA Shell

- [x] Create `src/theme/` with light and dark themes plus a `useAppTheme()` hook.
- [x] Use Material 3 colour roles with deep teal `#0F766E` as the brand seed and document the
      rationale.
- [x] Add Roboto Flex and configure typography with subtle variable weight transitions.
- [x] Set up router basename, CSS variables provider, safe-area global styles, and the root route.
- [x] Build the `AppShell` with top app bar, main slot, and optional bottom area.
- [x] Add the full PWA manifest and generated icon set from a stylised QR fragment mark.
- [x] Add iOS meta tags and dynamic theme-colour handling.
- [x] Verify Lighthouse PWA score is at least 95 before moving on.

## Phase 3 — Camera Viewfinder and QR Decoding

- [x] Build `src/features/camera/Viewfinder.jsx` with environment camera capture.
- [x] Add the scanning frame, dimmed mask, sweep line, and reduced-motion handling.
- [x] Add hint text and bottom controls for torch, camera flip, and image upload fallback.
- [x] Implement continuous downscaled `jsQR` decoding.
- [x] Add detection feedback with haptics, bracket pulse, polygon snap, and result transition.
- [x] Handle permission states explicitly.
- [x] Tear down streams on unmount and pause camera work when the document is hidden.

## Phase 4 — Result View: Re-emit the QR

- [x] Build `src/features/result/ResultView.jsx`.
- [x] Generate the canonical inline SVG with `qrcode`.
- [x] Export SVG as an image blob.
- [x] Export PNG through canvas rasterisation at 1024 x 1024.
- [x] Export vector PDF and document the chosen library.
- [x] Export DOCX with SVG and PNG fallback.
- [x] Generate filenames from the first eight SHA-1 characters of the payload.
- [x] Add loading, success, cancellation, and error feedback for export actions.

## Phase 5 — Share-as-URL

- [x] Encode payloads with `lz-string.compressToEncodedURIComponent` into `?q=`.
- [x] Disable URL sharing for payload URLs over 2000 characters with inline guidance.
- [ ] Share the URL on mobile and copy it on desktop.
- [ ] Show the copied URL pill and secondary QR preview on desktop.
- [ ] Add copy feedback with icon morph, success colour, and subtle scale animation.
- [ ] Load valid `?q=` payloads directly into the Result view and clear the query string.

## Phase 6 — Decoded Text Panel

- [ ] Open decoded text in a bottom sheet on mobile and a dialog on desktop.
- [ ] Render decoded text in a monospace code block with long-content scrolling.
- [ ] Detect and display payload kind.
- [ ] Add a clear external-link affordance for URL payloads.
- [ ] Add copy feedback matching the URL share interaction.

## Phase 7 — Ads Placeholder and Analytics

- [ ] Add `src/features/ads/AdSlot.jsx` behind `VITE_ADS_ENABLED`.
- [ ] Document planned AdSense wiring and keep the owned TODO on the roadmap.
- [ ] Add runtime GA4 injection behind `VITE_GA_MEASUREMENT_ID`.
- [ ] Commit `.env.example` and keep `.env.local` gitignored.
- [ ] Track privacy-safe events without sending QR content.
- [ ] Respect Do Not Track and provide a one-click analytics opt-out in the About sheet.

## Phase 8 — Polish

- [ ] Add a subtle page transition between Viewfinder and Result.
- [ ] Add the QR capture moment animation with graceful View Transitions fallback.
- [ ] Add long-press QR copy on mobile and a desktop tooltip.
- [ ] Verify dark mode parity on every screen.
- [ ] Complete accessibility pass for keyboard, ARIA, focus, live regions, and contrast.
- [ ] Add the About sheet with version, build hash, privacy note, and MIT licence link.
- [ ] Add a 404 page that redirects gracefully to `/`.

## Phase 9 — Hardening and Launch

- [ ] Complete the cross-device manual test matrix in `TESTING.md`.
- [ ] Meet Lighthouse budgets for performance, accessibility, best practices, SEO, and PWA.
- [ ] Keep the main bundle at or below 250 KB gzipped through lazy-loaded exporters.
- [ ] Tag `v1.0.0`, update `CHANGELOG.md`, and publish a brief GitHub release.

## Deferred Owned TODOs

- [ ] `TODO(ads)`: replace the placeholder ad strip with the real AdSense `ins` tag once the
      account and client ID are available.
