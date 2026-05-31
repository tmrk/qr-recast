# QR Recast v2 UX Audit

Date: 2026-05-31

## Screens Reviewed

- Deployed app at `https://tmrk.github.io/qr-recast/`.
- Local production preview at `http://127.0.0.1:4173/qr-recast/`.
- Narrow screenshots at 360 x 780 and 390 x 844.
- Desktop Result screenshot at 1280 x 900.

## Current Strengths

- The app already feels privacy-first: the first screen has one primary camera action, a secondary
  upload fallback, and a concise privacy note.
- The Material 3-inspired colour system is calm and coherent in dark mode, with strong brand
  recognition from the QR mark.
- The Result screen correctly makes the QR the visual hero, and desktop spacing is deliberate and
  uncluttered.
- The export model is understandable because every format is visible, and the existing decoded-text
  sheet has a clear raw-payload source-of-truth role.

## Friction Found

- The first-run headline says "Ready to scan", but the body does not explicitly tell a new user to
  point the camera at a QR code until after camera start. The first action can be clearer without
  becoming verbose.
- The 360 px first-run screenshot shows long text inside the status card pushing horizontally. The
  privacy note also clips because the flex text lacks enough shrink/wrap protection.
- The scanner has a large empty dark field above the card before the camera starts. It feels calm,
  but the composition does not yet communicate the camera viewfinder as the primary object.
- The Result view works well on desktop, but on a 390 px screenshot the QR card and filled export
  actions visually run past the right edge. The action grid is too dense for a major v2 feature set.
- All export buttons currently use the same filled emphasis. This makes secondary file formats
  compete with primary actions such as share, save, and batch capture.
- Type identity is absent from the Result hierarchy. The v1 payload-kind chip appears only in the
  decoded-text panel, so users cannot immediately tell whether the code is Wi-Fi, Matter, Home, URL,
  contact, or plain text.
- About and analytics settings are useful, but v2 preferences, branding, and batch management need a
  more scalable Settings surface than adding more controls to the current About sheet.
- The ad placeholder is unobtrusive now; future Result and batch surfaces must preserve enough
  breathing room so ads never crowd QR content or export controls.

## Phase 1 Refinements To Make

- Rework the first-run card copy to make "point your camera at a QR code" immediate, while keeping
  camera permission tied to the explicit primary button.
- Tighten the first-run status card at 360 px: enforce `min-width: 0`, robust wrapping, and stable
  button layout so privacy copy and upload controls never overflow.
- Refine the viewfinder composition so the frame, dimming mask, brackets, and sweep line feel like
  the centre of the experience even before permission is granted.
- Redesign Result actions around mobile ergonomics: keep the QR as hero, add a type identity header,
  promote one or two primary actions, and move secondary formats into a tidy download/share pattern.
- Keep "Show text" as the raw-payload source of truth, but make it visually secondary to the QR and
  detected type summary.
- Introduce a Settings entry point that can hold branding, batch, analytics, and privacy without
  overloading About.
- Verify the revised scanner, Result, decoded text, About, and Settings surfaces in light and dark
  mode at 360 px, 390 px, and desktop widths before starting type-detection implementation.

## Phase 1 Result

- Implemented clearer first-run camera copy and stable 360 px wrapping for the status card, upload
  fallback, and privacy note.
- Replaced the dense six-button Result grid with primary Copy URL and Download controls, a format
  menu, and secondary Show text and Scan again controls.
- Added the current payload identity chip to the Result header so type information is visible before
  the dedicated v2 type registry lands.
- Replaced the app-bar About icon with Settings as the preference entry point while keeping the
  existing analytics, privacy, version, build, and licence content.
- Verified emulated mobile light and dark layouts with no horizontal overflow, plus a desktop Result
  screenshot and the mobile Download menu.
