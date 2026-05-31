# QR Recast Architecture

QR Recast is a client-only PWA. QR images and decoded payloads stay on the user's device; no photo
or QR content is sent to a server by the app.

## Stack

- React and Vite for the application shell.
- JavaScript and JSX only for app source.
- Material UI with Material 3-inspired tokens for interface components.
- `jsqr` for on-device QR decoding.
- `qrcode` for canonical QR SVG generation.
- `jspdf` plus `svg2pdf.js` for vector PDF export.
- `docx` for Word document export.
- `lz-string` for compact share URLs.
- GitHub Actions and GitHub Pages for deployment.

## Folder Layout

```text
qr-recast/
├─ .github/workflows/deploy.yml
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icons/
│  └─ robots.txt
├─ scripts/
│  ├─ generate-icons.mjs
│  └─ check-spelling.mjs
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ theme/
│  ├─ components/
│  ├─ features/
│  ├─ lib/
│  └─ styles/
├─ AGENTS.md
├─ ROADMAP.md
├─ PROGRESS.md
├─ RECENT_CHANGES.md
├─ ARCHITECTURE.md
├─ DEPLOYMENT.md
├─ TESTING.md
├─ CONTRIBUTING.md
├─ CHANGELOG.md
├─ README.md
├─ LICENCE
├─ vite.config.js
├─ eslint.config.js
├─ .prettierrc
├─ .env.example
├─ package.json
└─ .gitignore
```

## Decisions

### 2026-05-28 — Client-only Privacy Boundary

QR Recast will decode and export QR payloads entirely in the browser. A server-side decode pipeline
would simplify some browser permission issues, but it would break the privacy promise and introduce
hosting, retention, and security concerns. The app will only send privacy-safe analytics events
when analytics is explicitly configured and allowed.

### 2026-05-28 — Material UI Version

`npm view @mui/material version` returned `9.0.1` before installation, so QR Recast starts on the
current stable Material UI line while satisfying the v6+ constraint. The theme will still use
Material 3-inspired roles and a deep teal seed rather than default MUI styling.

### 2026-05-28 — Vector PDF Export Library

QR Recast will use `jspdf` with `svg2pdf.js` for PDF export. The alternative was `pdf-lib`, but
that would require more custom SVG path handling to keep the QR as true vector artwork. `svg2pdf.js`
matches the canonical SVG generation path and keeps the conversion focused.

### 2026-05-28 — ESLint Compatibility

The Vite scaffold initially installed ESLint 10, while `eslint-plugin-react` currently declares peer
support through ESLint 9. QR Recast pins ESLint and `@eslint/js` to the latest 9.x line to keep
React, hooks, and accessibility linting clean without peer-dependency overrides.

### 2026-05-28 — Phase 1 PWA Icons

The Phase 1 manifest uses a small SVG QR Recast mark so the deployable skeleton has valid branding
immediately. Phase 2 will replace this with the full generated 192, 384, 512, maskable, and Apple
touch icon set from the same mark.

### 2026-05-28 — Pages Action Versions

The initial Pages workflow used the requested Pages action shape and deployed successfully, but
GitHub annotated the run with Node 20 action-runtime deprecations. The workflow now uses the current
major versions of the checkout, Node setup, Pages configuration, Pages artefact upload, and Pages
deployment actions while still building the project with Node 20 as specified.

### 2026-05-28 — Material 3 Theme Seed

The Phase 2 shell uses deep teal `#0F766E` as the brand seed. It gives the scanner a calm utility
feel, keeps the privacy note visually tied to trust and safety, and avoids the common purple-blue
PWA palette. Light and dark schemes are defined as Material 3-inspired roles in `src/theme/` and
served through MUI CSS variables.

### 2026-05-28 — PWA Icon Pipeline

The source mark lives at `public/qr-recast-mark.svg`, with a matching `favicon.svg` for the browser
tab. `scripts/generate-icons.mjs` uses Sharp to generate the 192, 384, 512, maskable 512, and Apple
touch PNG assets consumed by `public/manifest.webmanifest`.

### 2026-05-28 — Lighthouse PWA Audit Version

Lighthouse 13 no longer exposes a `pwa` category, so the Phase 2 PWA gate uses Lighthouse 11.7.1,
the newest tested release in this environment that still reports that category. The local preview
scored 100 before deployment.

### 2026-05-28 — Camera Permission Model

The camera viewfinder starts from an explicit button tap rather than requesting camera access on
mount. This keeps iOS PWA permission prompts tied to a user gesture and gives desktop users an
upload-only path when no camera is available. Successful scans are handed to an in-memory completion
view that now renders the Phase 4 export result.

### 2026-05-28 — Result Export Pipeline

The Result view treats the `qrcode` SVG string as the canonical QR representation and reuses it for
all exports. SVG is saved directly, PNG is rasterised through a 1024 x 1024 canvas, PDF stays vector
through `jspdf` and `svg2pdf.js`, and DOCX embeds UTF-8 SVG bytes with a PNG fallback because Word
expects both when an SVG image is present. The heavier generation libraries are loaded only from
export handlers so the initial scanner bundle stays small.

### 2026-05-31 — v2 Type-detection Registry

QR Recast v2 adds `src/lib/qr-types/` as a registry of pure detector functions rather than keeping
the old lightweight `payload.js` pattern. The resolver runs every detector, discards `null` results,
and chooses the highest-confidence result, with a plain-text fallback. This keeps the decode
pipeline stable, makes detectors fixture-testable, and avoids mixing camera or export logic with the
parsing rules.

The normalised detector result shape is:

```js
{
  type: 'wifi',
  label: 'Wi-Fi network',
  icon: 'wifi',
  fields: [{ key: 'ssid', label: 'Network name', value: 'Example' }],
  raw: 'WIFI:T:WPA;S:Example;P:secret;;',
  confidence: 0.92,
  branding: { kind: 'wifi', caption: 'Example' },
}
```

Existing analytics `payload_kind` values will be mapped from this richer type object so analytics
still never receives QR payload content.

Apple's public `HMAccessorySetupPayload` documentation confirms HomeKit setup payloads are URLs and
states that payload content details require the MFi Programme:
https://developer.apple.com/documentation/homekit/hmaccessorysetuppayload. Community tooling and
examples consistently use `X-HM://...`, with the first nine characters carrying encoded parameters
and the remaining characters commonly acting as the setup ID:
https://github.com/SimonGolms/homekit-code. QR Recast therefore classifies `X-HM://` payloads as
Apple Home accessories and exposes the encoded payload/setup ID where present, but does not decode
the private MFi-only setup code.

For Matter, the CSA Matter 1.4 Core Specification is the authoritative source
(`24-27349-006_Matter-1.4-Core-Specification.pdf`), while Silicon Labs' Matter commissioning guide
documents scanned QR payloads in the `MT:Y.K9042C00KA0648G00` form and lists the onboarding data
they carry: https://docs.silabs.com/matter/2.4.0/matter-overview-guides/matter-commissioning. QR
Recast validates the `MT:` prefix and Base-38 shape (`0-9`, `A-Z`, `-`, `.` and chunk separators)
but deliberately avoids fragile full onboarding decoding until a small, well-sourced decoder is
worth the extra surface area.

### 2026-05-31 — v2 Branding Assets and Trademark Handling

Branding is implemented in `src/features/branding/` as an SVG decorator around the canonical QR
generated by `qrcode`. `createDecoratedQrSvg()` returns the original canonical SVG when branding is
disabled or if SVG parsing fails, so exports fail soft instead of blocking the user. When enabled,
the decorator creates a 360 x 360 vector canvas, places a compact type badge at the top, and nests
the untouched QR SVG below it at 284 x 284. The generated QR's quiet zone and modules are not
modified.

QR Recast deliberately does not embed Matter, Apple, Apple Home, HomeKit, Works with Apple Home, or
Wi-Fi Alliance logo files. Apple's Works with Apple Home guidance requires certification/request
flows and forbids creating substitute Apple Home graphics in some contexts:
https://developer.apple.com/apple-home/works-with-apple-home/. Apple's general trademark guidance
also reserves broader logo use to licensed contexts:
https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html. The Connectivity
Standards Alliance trademark guidelines prohibit uses that imply certification, endorsement, or
confusing affiliation:
https://csa-iot.org/wp-content/uploads/2022/10/Alliance-Brand-Trademark-Logo-Usage-Guidelines_09.30.2022.pdf.
Because QR Recast is a general backup/export tool rather than a certified accessory vendor, v2 uses
neutral original vector badges labelled by payload type, including "Matter device" and "Apple Home
accessory", instead of copying protected brand marks. No remote logo assets are hotlinked, and no
third-party branding assets are stored under `src/assets/branding/` in this phase.

The branding preference is stored independently from analytics and future batch state under
`qr-recast:preferences:v1`:

```js
{
  version: 1,
  brandingEnabled: true,
  updatedAt: '2026-05-31T14:18:04.615Z'
}
```

Missing or unreadable preference data defaults to `brandingEnabled: true`. The Result view also
keeps a per-payload override in React state so a user can change branding for the current QR without
changing the saved default.

### 2026-05-31 — v2 Batch State Model

Batch Recast persists only canonical payload data and derived metadata in localStorage. The storage
key is `qr-recast:batch:v1`; user preferences use the separate `qr-recast:preferences:v1` key. The
batch envelope includes a schema version and a migration shim so future releases can change shape
safely. `src/features/batch/store.js` owns reads, writes, migrations, name normalisation, item
creation, rename, reorder, delete, restore, and clear operations.

Persisted batch shape:

```js
{
  version: 1,
  updatedAt: '2026-05-31T12:00:00.000Z',
  items: [
    {
      id: 'crypto-random-id',
      name: 'Living room thermostat',
      payload: 'MT:...',
      type: { type: 'matter', label: 'Matter device', confidence: 0.9 },
      branding: { enabled: true, kind: 'matter' },
      createdAt: '2026-05-31T12:00:00.000Z',
      updatedAt: '2026-05-31T12:00:00.000Z'
    }
  ]
}
```

Raw photos and decoded camera frames are deliberately excluded.

Type detection is lazy-loaded when a payload is added to the batch so the initial scanner chunk
stays under the launch budget. Stored items keep a serialised type object and per-item branding
state, so restored batches do not need to re-parse every payload on startup.

### 2026-05-31 — v2 Batch Export Layout

Single and batch exports will share one decorated QR rendering path. Batch SVG and PNG exports will
use generated sheet SVGs; PNG will rasterise each sheet at print-safe resolution. PDF will stay true
vector with `jspdf` and `svg2pdf.js`, using A4 pages, two columns, fixed margins, gutters, captions,
footers, and page numbers. DOCX will use a table-based two-column layout because it is the most
predictable Word rendering path, with SVG media and PNG fallback for each QR. Heavy PDF and DOCX
libraries remain lazy-loaded from export handlers.
