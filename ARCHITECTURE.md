# QR Recast Architecture

QR Recast is a client-only PWA. QR images and decoded payloads stay on the user's device; no photo
or QR content is sent to a server by the app.

## Stack

- React and Vite for the application shell.
- JavaScript and JSX only for app source.
- Material UI with Material 3-inspired tokens for interface components.
- `jsqr` for on-device QR decoding.
- `qrcode` for canonical QR SVG generation.
- `jspdf` plus `svg2pdf.js`, or `pdf-lib`, for vector PDF export. The final choice will be logged
  during Phase 1.
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
view until Phase 4 replaces it with the full export result view.
