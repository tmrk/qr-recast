# Changelog

All notable changes to QR Recast will be documented in this file.

The format is based on Keep a Changelog, and this project uses Semantic Versioning.

## [Unreleased]

### Added

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

- Lazy-loaded QR, result, and document-export paths so the main bundle stays below the launch gzip
  budget.

### Verified

- Lighthouse launch budgets on local production preview: Performance 96, Accessibility 100, Best
  Practices 100, SEO 91, and PWA 100.
- Main bundle launch budget: 157.12 KB gzip.
- GitHub Pages deployments from `main` through GitHub Actions.
