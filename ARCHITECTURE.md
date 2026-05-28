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
