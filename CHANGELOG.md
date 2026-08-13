# Changelog

All notable changes to QR Recast will be documented in this file.

The format is based on Keep a Changelog, and this project uses Semantic Versioning.

## [Unreleased]

### Fixed

- Render Matter manual codes as independently centred characters so SVG, PDF, and DOCX renderers
  keep the code aligned with the logo and visible QR module field.
- Centre single QR artwork vertically and horizontally on A4 PDF and DOCX pages while retaining a
  proper document footer.
- Stabilise batch PDF card strokes and caption bounds, and give batch DOCX exports fixed A4 table
  geometry, light borders, and page-aware footers.

## [2.1.0] - 2026-08-12

### Added

- Added 47 Vitest domain tests for detector fixtures, Matter onboarding codes, lossless share
  compression, QR generation, quiet zones, forced versions, SVG-input sanitisation, and visible QR
  registration alignment.
- Added three Playwright journeys for the mobile single/share/export flow, desktop overflow, and a
  persisted seven-item batch with all export formats.
- Added pull-request and deployment gates that run the complete project check and Playwright
  journeys on Node 24.

### Changed

- Reworked the scanner and Result surfaces as a purpose-built optical recasting workbench, with a
  persistent capture frame, clearer proof hierarchy, explicit Clean/Labelled output choices, and
  deliberate mobile and desktop layouts.
- Recast Batch Recast as a numbered contact sheet with aspect-preserving previews and clearer
  ordering and export controls. Each saved item can now switch independently between Clean and
  Labelled output, and the choice persists into every batch export.
- Updated the project to version 2.1.0, Node 24, npm 11, and current compatible dependency releases;
  ESLint remains intentionally on the latest 9.x line until the React lint plug-ins declare ESLint
  10 peer compatibility.
- Moved compressed payload sharing from the request query to the `#q=` URL fragment. Existing
  `?q=` links continue to load for compatibility.
- Migrated batch persistence to `qr-recast:batch:v2` and recalculate detector metadata from the
  canonical payload when restoring stored items.
- Updated the PWA and GitHub Pages workflows to use the same complete check and Node 24 toolchain.

### Fixed

- Always QR-encode string input instead of treating SVG-looking payload text as trusted artwork.
- Preserve literal plus signs in decoded payload fields instead of converting them to spaces.
- Disable automatic analytics page views so payload-bearing URL fragments cannot be collected as
  page views, and override every GA command with the fragment-free application root while retaining
  the fixed event/parameter allowlist.
- Preserve portrait setup-card proportions in batch DOCX PNG fallbacks and other export placement.
- Register Matter, Apple Home, and utility label rows to the exact visible QR module field rather
  than the outside of the quiet zone.
- Render sampled QR modules as individually closed, filled geometry so SVG-to-PDF conversion cannot
  introduce line-cap leakage or visible module gaps.
- Preserve shared-link search and fragment data through the React catch-all and GitHub Pages 404
  recovery path.

## [2.0.5] - 2026-06-17

### Changed

- Replaced the three-way colour-scheme selector with a sun/moon control that follows the operating
  system on first use and remembers the user's first explicit choice.
- Aligned the Matter mark, QR, and pairing number to a shared 248-pixel column.

## [2.0.4] - 2026-06-17

### Changed

- Recast dependable photographed symbols from their sampled module grid instead of reproducing only
  the decoded payload and version.
- Improved luminance sampling and finder-based adaptive thresholds, and recovered mask and
  error-correction format information for closer, still scannable traces.

## [2.0.3] - 2026-06-17

### Fixed

- Preserved the original QR version and data size when enough decode metadata is available, while
  retaining a safe larger-symbol fallback when the payload cannot fit.

## [2.0.2] - 2026-06-17

### Changed

- Matched the static first-screen fallback to the operating system's dark preference.
- Removed unused React type packages from the JavaScript-only project.

## [2.0.1] - 2026-06-01

### Changed

- Refined Apple Home and Matter branded setup-card artwork to match real setup-label conventions:
  Apple Home uses the supplied house mark with a two-line eight-digit code above the QR, while
  Matter uses the supplied full-width wordmark with the dashed manual code below the QR.
- Preserved non-square branded setup-card proportions through preview rendering and SVG, PNG, PDF,
  DOCX, and Batch Recast export paths.

### Fixed

- Decoded the eight-digit Apple Home setup code from `X-HM://` QR payloads instead of using the
  four-character setup ID as the printed code.

## [2.0.0] - 2026-05-31

### Added

- Type-aware Result details with icons, structured fields, per-field copy actions, masked sensitive
  values, and a raw-payload decoded-text header.
- Type-aware neutral vector branding around recast QR codes, with branding on by default, a
  remembered Settings default, and a per-Result override that flows into SVG, PNG, PDF, and DOCX
  exports.
- Batch Recast core with a single/batch capture switch, versioned localStorage persistence,
  capture-to-name flow, editable names, drag and button reordering, duplicate warning, clear
  confirmation, delete undo, and restored session continuity.
- Batch export pipeline for two-column SVG, PNG, PDF, and DOCX output with captions, branding,
  deterministic batch filenames, PDF page footers, and DOCX SVG media plus PNG fallbacks.
- Settings surface for branding, Batch Recast resume/clear management, analytics opt-out, and
  About/Privacy in one mobile-first sheet.
- QR type-detection registry with fixture coverage for URL, plain text, Wi-Fi, Apple Home, Matter,
  email, SMS/MMS, telephone, geo, calendar, contact, crypto, and app-link payloads.
- `npm run check:qr-types` to keep QR type fixtures exercised during linting.
- Started the v2 release track for type recognition, branding, Batch Recast, and the supporting UX
  audit and architecture notes.
- Mobile-first Material UI PWA shell with light and dark colour schemes, safe-area support,
  generated app icons, and GitHub Pages base-path handling.
- On-device QR scanning with an environment-camera viewfinder, upload fallback, explicit permission
  states, reduced-motion handling, stream cleanup, detection feedback, and haptic affordances.
- Result view that re-emits the scanned payload as a clean canonical QR code.
- SVG, 1024 x 1024 PNG, vector PDF, and DOCX exports with deterministic payload-hash filenames.
- Compressed `?q=` share URLs with desktop copy feedback, mobile native sharing, oversized-payload
  guidance, and direct shared-link loading.
- Decoded text dialog and mobile bottom sheet with payload-kind labels, URL opening, copy feedback,
  and long-content scrolling.
- Optional advertisement placeholder and runtime GA4 analytics behind environment flags.
- Analytics privacy controls that respect Do Not Track, offer a one-click opt-out, and avoid sending
  QR contents, generated URLs, filenames, image data, hashes, or exported files.
- About sheet with version, build hash, privacy note, analytics controls, and MIT licence link.
- Subtle scanner/result transitions, QR capture animation, and long-press QR PNG copying.
- Static GitHub Pages `404.html` redirect for deep-link recovery.
- Automated and manual testing notes covering browser engines, mobile-shaped flows, QR variants,
  PWA checks, export integrity, launch budgets, and remaining real-device verification.

### Changed

- Refined the first-run camera copy, narrow mobile wrapping, Result payload identity, export action
  hierarchy, and app-bar Settings entry point for the v2 UX pass.
- Migrated analytics opt-out persistence to the versioned `qr-recast:analytics:v1` key while
  preserving existing local opt-outs.
- Lazy-loaded QR, result, and document-export paths so the main bundle stays below the launch gzip
  budget.

### Verified

- Lighthouse launch budgets on local production preview: Performance 91, Accessibility 100, Best
  Practices 100, SEO 91, and PWA 100.
- Main bundle launch budget: 156.25 KB gzip.
- GitHub Pages deployments from `main` through GitHub Actions.
