# Recent Changes

Newest entries stay at the top. Keep roughly the last 20 meaningful changes here; older entries
move into `CHANGELOG.md`.

- 2026-08-13: Corrected renderer-dependent Matter manual-code alignment in PDF and DOCX exports,
  centred single artwork on A4 pages, and tightened batch PDF card bounds and DOCX page geometry.
  Fresh SVG, PNG, PDF, and DOCX exports passed structural checks and visual inspection; the Matter
  payload decoded exactly from all four single formats, and all seven payloads decoded exactly from
  both rendered two-page batch documents. Mobile dark and desktop light browser layouts also
  remained aligned and free of horizontal overflow.
- 2026-08-12: Released v2.1.0 with the optical recasting interface, contact-sheet Batch Recast
  layout and per-item output styles, exact visible-module branding registration, fragment-based
  private sharing, batch v2 migration, and renderer-independent filled module geometry. Added 47
  domain tests and three Playwright journeys; rendered Matter PDF/DOCX and the two-page batch PDF
  and DOCX decoded exactly. The complete clean-install gate, Pages workflow, and live 360 px smoke
  test passed.
- 2026-06-17: Theme selector simplified to a sun/moon toggle with rolling rotation animation on
  switch; removed "system" option entirely; first visit now follows OS dark/light preference via
  MUI default, subsequent loads and all after a toggle use the persisted explicit choice in
  localStorage. Matter branded setup cards now have logo, QR code, and pairing number rows aligned
  to identical width (248 px) and centred nicely within the card. Bumped to v2.0.5.
- 2026-06-17: Higher-fidelity photographed recasts: sub-pixel luminance sampling, 7×7 voting and
  richer finder-based adaptive threshold in module extraction; recover exact mask pattern and ECL
  from format information bits next to finders; smart hybrid keeps direct sampled grid (when
  validation passes for scannability) else falls back to generator forced to version + recovered
  mask/ECL. Threaded modulesGrid + recovered params through single and Batch Recast so batch items
  also yield faithful traces. Consistent 4-module quiet zone. Bumped sampling res for uploads and
  video decode frames. All gates green, local preview verified.
- 2026-06-17: Truly recast the _exact_ photographed QR (same modules, not just version). On
  successful camera/upload decode we now sample the module grid directly from the imageData using
  the detected corner locations, then choose the ECL+mask combination whose generated matrix most
  closely matches the photo while forcing the original version. Result is crisp, valid, scannable
  and visually faithful. Synthetic/share paths unchanged. Bumped to v2.0.4.
- 2026-06-17: Improved the static first-screen fallback to respect system dark mode via media query
  and match the Material theme colours. Removed unused `@types/react` packages for strict
  JavaScript-only compliance. Cleaned stale v1.0.0 tagging reference in ROADMAP. Bumped to v2.0.2
  and pushed to trigger Pages deployment.
- 2026-06-01: Overhauled the interface with a refined teal palette, a consistent radius scale,
  softer layered elevation, and a single aligned branding card whose logo, QR, and caption share
  one column. Fixed the Batch Recast panel so the export action stays pinned and can no longer be
  clipped, and tightened batch item, header, and footer alignment.
- 2026-06-01: Aligned Settings toggle switches with a fixed control column and scoped switch
  sizing.
- 2026-06-01: Centred the idle Batch Recast panel so it matches the Single capture screen layout.
- 2026-06-01: Corrected Batch Recast light-mode surfaces and made single and batch PDF pages export
  with white backgrounds for printing.
- 2026-06-01: Fixed the duplicate Batch Recast camera entry, aligned Settings preference controls,
  and added the Settings colour scheme selector.
- 2026-06-01: Released QR Recast v2.0.1 with refined Apple Home and Matter setup-card branding,
  Apple Home setup-code decoding, and aspect-aware setup-card exports.
- 2026-06-01: Corrected Matter manual setup-code generation so branded recasts match the code
  printed on Matter setup labels.
- 2026-05-31: Hardened Batch Recast entry and setup-code branding with batch-local scan actions,
  Matter manual-code extraction, and cleaner Matter/Apple Home setup-card exports.
- 2026-05-31: Released QR Recast v2.0.0 with final checks, tag, GitHub release notes, and live
  GitHub Pages deployment.
- 2026-05-31: Prepared the v2.0.0 release with final Lighthouse/bundle hardening, deferred PWA
  registration, a static first-screen fallback, and package version bump.
- 2026-05-31: Completed v2 Phase 7 after the Settings and persistence surface deployed through
  GitHub Pages.
- 2026-05-31: Added the v2 Settings surface for branding, Batch Recast management, analytics
  opt-out migration, and About/Privacy.
- 2026-05-31: Completed v2 Phase 6 after the Batch Recast export pipeline deployed through GitHub
  Pages.
- 2026-05-31: Added the v2 batch export pipeline for two-column SVG, PNG, vector PDF, and DOCX
  exports with captions, branding, pagination, and deterministic filenames.
- 2026-05-31: Completed v2 Phase 5 after the Batch Recast core deployed through GitHub Pages.
