# QR Recast Architecture

QR Recast is a client-only React PWA for recovering QR payloads from camera frames or image files,
then producing clean, reusable artwork. The decoded text is the canonical product value: every
preview, share link, and export must represent that text without silent alteration.

## System boundary

The application is a static GitHub Pages site. There is no QR decoding, document generation,
database, or application API on a server.

```text
camera frame or image file
  -> jsQR decode and corner detection
  -> canonical payload text
  -> type detector registry
  -> QR reconstruction
       sampled module trace when validation succeeds
       generated canonical QR as the safe fallback
  -> optional branding decorator
  -> preview, share link, or SVG / PNG / PDF / DOCX export
```

Remote scripts are optional and separate from this data path. Google Analytics is loaded only when
configured and permitted. Advertising is an environment-controlled placeholder. Neither receives
payload text or generated artefacts from application code.

## Capture and reconstruction

`src/features/camera/Viewfinder.jsx` owns camera permission states, stream lifecycle, file upload,
scan feedback, and the hand-off to `HomeView`. `src/lib/decode.js` downsamples input for `jsQR`,
which returns both the decoded text and detected corners.

For a suitable photograph, the decoder samples the QR modules from those corners. `src/lib/qr.js`
validates the grid, recovers format information where possible, and can reproduce the sampled
version, error-correction level, and mask. If that evidence is incomplete or the traced symbol does
not validate, `qrcode` generates a clean symbol from the canonical payload. Both paths keep a
four-module quiet zone.

`createQrSvg()` accepts payload data or controlled reconstruction metadata; arbitrary input strings
are always encoded as QR content, never treated as trusted SVG markup.

Sampled-grid SVGs represent every dark module as an individually closed, filled square. They do not
depend on stroke joins or line caps, so the geometry stays consistent across browsers, rasterisers,
and the SVG-to-PDF renderer.

## Type recognition

`src/lib/qr-types/` contains a registry of pure detector functions. Each detector receives only the
raw string, returns a normalised result or `null`, and must fail softly for arbitrary input. The
resolver selects the strongest result and otherwise returns plain text.

The result includes a type, label, icon key, structured fields, confidence, raw payload, and
branding hints. Current fixtures cover URL, Wi-Fi, Apple Home, Matter, email, SMS/MMS, telephone,
geo, calendar, contact, crypto, app-link, and plain-text inputs. Matter decoding has a separate pure
parser for deriving a manual setup code only when the onboarding payload supplies enough data.

## Branding

`src/features/branding/decorator.js` wraps the canonical QR SVG; it does not edit its modules,
finder patterns, colours, or quiet zone. Branding is enabled by default and saved independently. A
result can override it for the current payload, while every saved batch item has its own persisted
Clean or Labelled choice.

Matter and Apple Home have portrait setup-card compositions with embedded vector marks and setup
codes. The Matter mark and manual code register exactly to the visible QR module field, excluding
its required quiet zone. Apple Home and utility headers also derive their alignment from that visible
field. Utility types use an icon-and-label header above a full-width QR, with a short caption only
when useful. All assets are embedded locally: exports do not hotlink remote images. These labels
identify decoded payload types and do not claim certification or endorsement.

If decoration cannot safely parse the generated SVG, the function returns the undecorated canonical
SVG so export can fail soft.

## Result and export paths

`src/features/result/ResultView.jsx` derives one canonical SVG and one decorated SVG for the active
payload. It also presents structured fields, raw decoded text, sharing controls, and the per-result
branding choice.

Single exports in `src/lib/exporters.js` use the same decorated SVG:

- SVG saves the vector source directly.
- PNG rasterises onto a white canvas with a 1,024-pixel long edge while preserving aspect ratio.
- PDF uses `jsPDF` and `svg2pdf.js` to place vector artwork on a white A4 page.
- DOCX embeds the SVG as the primary image and packages a PNG compatibility fallback, preserving
  non-square setup-card proportions.

Filenames include the first eight hexadecimal characters of a SHA-1 digest of the canonical
payload. The digest is only a stable filename suffix; it is not a security boundary and is never
sent to analytics.

## Batch Recast

`src/features/batch/store.js` owns batch creation, migration, persistence, naming, duplicate
feedback, ordering, deletion, restoration, and clearing. A stored v2 item may contain:

```js
{
  id,
  name,
  payload,
  version,
  modulesGrid,
  maskPattern,
  errorCorrectionLevel,
  type,
  branding: { enabled, kind },
  createdAt,
  updatedAt,
}
```

The source photograph and camera frame are never stored. The v1 store migrates to v2 on read;
detector metadata is recalculated from the canonical payload rather than trusted indefinitely.

`src/features/batch/exporters.js` regenerates each item through the same canonical and decoration
layers. SVG and PNG are tall printable sheets; PDF uses real A4 pages; DOCX uses table-based
two-column pages. Each page holds up to six named items and includes a page footer.

## Sharing and routing

`src/lib/qr.js` compresses the payload with `lz-string` and builds a root URL whose fragment contains
`#q=<encoded payload>`. URL fragments are handled by the browser and are not included in the HTTP
request to GitHub Pages. A recipient of the complete URL can still decode the payload, so share URLs
must be treated as containing the original information.

`HomeView` reads fragments first. It also accepts the former `?q=` query parameter so existing
links keep working, then removes the share value from the visible address after loading. The static
404 page and React catch-all route preserve search and fragment data while recovering the Pages app
root.

## Local storage and privacy

Storage concerns use separate keys so they can migrate independently:

| Concern       | Current key                | Stored data                                                               |
| ------------- | -------------------------- | ------------------------------------------------------------------------- |
| Batch         | `qr-recast:batch:v2`       | Payloads, names, order, reconstruction/type/branding metadata, timestamps |
| Branding      | `qr-recast:preferences:v1` | Default branding choice and update time                                   |
| Analytics     | `qr-recast:analytics:v1`   | Opt-out choice and update time                                            |
| Colour scheme | `qr-recast-colour-scheme`  | Explicit light/dark choice                                                |

The batch store reads `qr-recast:batch:v1` for migration. Analytics reads the former
`qr-recast-analytics-opt-out` flag so an existing opt-out remains effective.

Analytics events and parameters are both allowlisted in `src/features/analytics/events.js`.
Automatic GA page views are disabled, and every configuration and event command overrides
`page_location` with the fragment-free application root. Do Not Track and the local opt-out disable
analytics completely.

## Interface structure

```text
src/
├─ App.jsx                         routing and app-level lazy surfaces
├─ components/                    shell and dynamic theme-colour metadata
├─ features/
│  ├─ about/                      settings, privacy, and build information
│  ├─ ads/                        optional advertisement placeholder
│  ├─ analytics/                  allowlisted, opt-out-aware analytics
│  ├─ batch/                      batch UI, v2 store, thumbnails, and exporters
│  ├─ branding/                   SVG decorator and preference storage
│  ├─ camera/                     viewfinder, upload, and camera lifecycle
│  ├─ home/                       single/batch orchestration and shared-link load
│  └─ result/                     proof, details, sharing, and export actions
├─ lib/
│  ├─ qr-types/                   detector registry, fixtures, and Matter parser
│  ├─ decode.js                   image/video decoding and module sampling
│  ├─ exporters.js                single-result document exporters
│  ├─ files.js                    native share, download, and clipboard handling
│  └─ qr.js                       generation, trace recovery, rasterisation, hash, share codec
├─ theme/                         Material 3-inspired light/dark tokens
├─ index.css                      responsive product styling
├─ main.jsx                       React entry point
└─ strings.js                     British English interface copy
```

`tests/` contains Vitest domain tests and three Playwright browser journeys. `scripts/` contains
spelling, detector-fixture, and icon checks. Vite builds the PWA and Workbox service worker with the
`/qr-recast/` Pages base path.

## Toolchain and dependency policy

Development and CI use Node 24 and npm 11. `npm run check` is the core code gate: Prettier,
ESLint, spelling, detector fixtures, Vitest, and the production build. Pull requests and pushes to
`main` run it before the Pages artefact can deploy.

`npm run test:e2e` builds to an isolated test directory, serves that production output, and runs the
Playwright journeys with a non-production analytics identifier. It is separate from `npm run check`,
but both CI workflows require it before delivery.

Runtime and build dependencies are kept on current compatible releases. ESLint and `@eslint/js`
intentionally remain on the latest 9.x line because the installed React lint plug-ins do not all
declare ESLint 10 compatibility. Moving to ESLint 10 should wait for compatible peer ranges rather
than relying on forced installation.
