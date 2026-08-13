# Testing QR Recast

QR Recast's central correctness rule is simple: the payload decoded from the source must be the
payload represented by every preview, shared link, and exported QR. Visual polish is not evidence
of correctness, so release checks combine domain tests, browser journeys, rendered-file inspection,
and QR decoding.

## Automated evidence gate

Use Node 24 and npm 11. From a clean checkout:

```sh
npm ci
npm run check
```

`npm run check` runs, in order:

1. `npm run format:check` — Prettier verification.
2. `npm run lint` — ESLint, British English spelling, and detector-fixture checks.
3. `npm run test:unit` — Vitest domain tests.
4. `npm run build` — the production Vite and PWA build.

Focused commands remain available:

```sh
npm run test:unit
npm run test:e2e
npm run check:qr-types
npm run check:spelling
npm run preview
```

`npm run test:e2e` runs three committed Playwright journeys against a local Vite server. It remains
separate from `npm run check`, so both results must be reported when browser coverage is required.

## Current automated coverage

The Vitest suite contains 47 tests across five files:

- QR type-registry fixture classification, arbitrary-input safety, and plain-text fallback.
- Matter onboarding parsing and manual-code formatting.
- Lossless share-payload compression, including Unicode, separators, and malformed input.
- Canonical QR generation, forced version and quiet-zone behaviour, overflow fallback, SVG-input
  sanitisation, and image-level decode of generated output.
- Matter, Apple Home, and utility branding registration against the visible module field, including
  rendered image-level decode of the decorated symbols.

The three Playwright journeys cover:

- A 360 px mobile Matter upload, Clean/Labelled switching, visible-module alignment, `#q=` sharing
  and round-trip payload recovery, sanitised analytics location metadata, plus SVG, PNG, PDF, and
  DOCX downloads and structural checks.
- A 1,440 px desktop scanner/result journey with a system-dark start, explicit light override, and
  horizontal-overflow assertions.
- A 390 px seven-item batch with rename, reorder, per-item Clean/Labelled style, v2 persistence, a
  two-page contact sheet, all four export formats, and exact decode of every QR in the batch PNG.

### Recorded evidence

| Date       | Revision state        | Evidence                                                                  |
| ---------- | --------------------- | ------------------------------------------------------------------------- |
| 2026-08-13 | Local export worktree | `npm run check`: 5 files and 47 tests passed; production build passed     |
| 2026-08-13 | Local export worktree | `npm run test:e2e`: all 3 Playwright journeys passed                      |
| 2026-08-13 | Local export worktree | SVG XML, PDF streams, and DOCX ZIP relationships passed structural checks |
| 2026-08-13 | Local export worktree | Rendered single SVG, PNG, PDF, and DOCX decoded to the exact Matter value |
| 2026-08-13 | Local export worktree | All 7 QRs decoded exactly from rendered two-page batch PDF and DOCX       |
| 2026-08-13 | Local export worktree | 360 px dark and 1,280 px light result layouts passed visual inspection    |
| 2026-08-12 | Local 2.1.0 worktree  | `npm ci` and `npm run check`: clean install and complete gate passed      |
| 2026-08-12 | Local 2.1.0 worktree  | `npm run test:unit`: 5 files passed, 47 tests passed                      |
| 2026-08-12 | Local 2.1.0 worktree  | `npm run test:e2e`: 3 Playwright journeys passed                          |
| 2026-08-12 | Local 2.1.0 worktree  | Rendered Matter PDF and DOCX each decoded to `MT:OA3126F-034OCH6VQ00`     |
| 2026-08-12 | Local 2.1.0 worktree  | Rendered two-page batch PDF: all seven QRs decoded to their exact values  |
| 2026-08-12 | Local 2.1.0 worktree  | Rendered two-page batch DOCX: all seven QRs decoded to their exact values |

This table records checks that actually ran. These results do not imply that camera, native sharing,
PWA installation, or the wider real-device browser matrix passed.

## Browser journey protocol

Exercise styling changes at 360 px and at a deliberate desktop width such as 1,280 px. Test light
and dark schemes, keyboard navigation, reduced motion, and horizontal overflow.

### Scanner and single result

1. Load a production preview from a cold tab and confirm the scanner shell is usable before any
   camera permission request.
2. Upload QR images containing plain text, Unicode, a URL with `+`, Wi-Fi credentials, Matter, and
   Apple Home payloads. Confirm each decoded-text view contains the exact source payload.
3. Verify a low-contrast or slightly rotated QR succeeds where practical, and that an unreadable
   image fails with recovery guidance rather than a stuck state.
4. Confirm the proof artwork has an intact quiet zone and crisp finder/module geometry.
5. Toggle Clean and Labelled output. Confirm the preference and one-result override behave as
   described and do not change the decoded payload.
6. Exercise Show text, copy, safe external-link opening, Scan again, Settings, colour scheme, and
   the analytics opt-out with keyboard and pointer input.
7. Confirm the 360 px page has no horizontal scrolling, clipped action, obscured focus indicator,
   or control smaller than a practical touch target.

### Sharing and routing

1. Share or copy a short payload and confirm the generated URL uses `#q=`, not a query parameter.
2. Open that URL in a fresh tab. Confirm it loads the exact payload and clears the fragment from the
   visible address once consumed.
3. Open a known legacy `?q=` URL and confirm it still loads, then clears the query string.
4. Confirm literal plus signs survive sharing; they must not become spaces.
5. Confirm malformed compressed data returns safely to the scanner.
6. Confirm an oversized share URL is disabled with clear guidance.
7. With analytics configured, inspect the data layer and network requests. No payload, fragment,
   filename, hash, image, or exported content may be present, and GA automatic page views must stay
   disabled.

### Batch Recast

1. Enter Batch Recast, capture at least seven different QR types, and give them distinct names.
2. Confirm duplicate feedback, rename, drag/button reorder, delete, Undo, and clear confirmation.
3. Reload and confirm order, names, payloads, reconstruction metadata, and branding state restore
   from `qr-recast:batch:v2`; no source image data should be present.
4. Seed a valid v1 batch and confirm it migrates to v2 while recalculating type metadata.
5. At 360 px, confirm every item remains identifiable, thumbnails preserve setup-card aspect ratio,
   and the export action remains reachable. At desktop width, confirm the contact-sheet layout and
   reading order remain clear.

## Camera and installed-PWA protocol

Camera, native sharing, and installation require a suitable real device for release-level evidence.

1. Start the rear camera from a user gesture and scan a printed or second-screen QR.
2. Confirm detection feedback precedes the Result view and the decoded payload is exact.
3. Deny camera permission and confirm upload remains available as recovery.
4. Background the app while scanning and confirm capture pauses; foreground it and confirm recovery.
5. Stop or leave the result and confirm the media stream is released.
6. Use native URL sharing and file sharing on a supported device, including cancellation.
7. Install the PWA, launch it in standalone mode, and confirm shell colours and safe areas.
8. After one online load, disconnect networking and confirm the application shell reloads offline.
9. Repeat upload decoding and at least one export from the installed app.

Record device model, operating-system version, browser version, date, and tester. Emulation is useful
regression evidence but does not replace these checks.

## Export verification protocol

Use payloads that expose character corruption (`+`, `%`, Unicode), a standard square label, a
Matter setup card, and an Apple Home setup card. For each download, record the exact filename and
confirm its eight-character hash suffix is stable for the payload.

### Single exports

- SVG: parse as XML, inspect the viewBox and quiet zone, rasterise it, and decode the rendered QR
  back to the exact payload.
- PNG: confirm the MIME type, pixel dimensions, white background, preserved aspect ratio, and exact
  decode result.
- PDF: run `qpdf --check` or an equivalent structural check, render every page to an image, inspect
  placement and clipping, zoom for vector-sharp edges, and decode the rendered QR.
- DOCX: inspect the ZIP relationships for both SVG and PNG media, render the complete document with
  LibreOffice or Word, inspect every page, and decode the rendered QR. Confirm portrait setup cards
  are not squeezed into a square fallback.

For Matter labelling, verify the vector mark and formatted manual-code row register to the visible
module field, not the outside of its quiet zone. For Apple Home and utility labels, verify headers,
QR artwork, and captions form a consistent column without crowding the quiet zone.

### Batch exports

Generate at least seven items so pagination is exercised.

- SVG and PNG should form one tall sheet with two A4-proportioned page regions.
- PDF and DOCX should contain two real pages, with no missing or repeated item.
- Each page should use two columns, no more than six items, correct names, and the right page footer.
- Every QR should decode to its corresponding stored payload after rendering.
- Branded and clean items must retain their own saved setting and aspect ratio.

Browser download success alone is insufficient: inspect and decode the artefact.

## Accessibility and presentation checks

- Run an automated accessibility scan on scanner, result, decoded text, Settings, and non-empty
  Batch Recast surfaces in both colour schemes.
- Navigate all controls using Tab, Shift+Tab, Enter, Space, and Escape.
- Confirm focus returns to the initiating control after a dialog, drawer, or menu closes.
- Check status and error announcements with a screen reader or accessibility tree.
- Confirm semantic labels do not depend on icon shape or colour alone.
- With reduced motion enabled, confirm scanning and transition effects stop or simplify without
  hiding state changes.
- At 200% zoom and 360 CSS pixels, confirm content reflows without loss of function.

## Historical baseline and current gaps

Earlier releases recorded successful local and deployed upload decoding, real-mobile camera
scanning, cross-engine emulation, offline reload, accessibility scans, and single/batch export
generation. The v2.0 export baseline also structurally checked vector PDF output and DOCX SVG/PNG
relationships. These results are useful regression context, but they do not certify the 2.1.0
worktree.

Release verification remains incomplete until the current candidate is checked on real iOS and
Android hardware, in an installed PWA, and in native Microsoft Word and Adobe Acrobat where those
targets matter. Any unavailable platform must be reported as an evidence gap rather than marked as
passed.
