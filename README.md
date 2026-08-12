# QR Recast

QR Recast turns a photographed QR code back into dependable, clean artwork. It scans with the
camera or reads an uploaded image, decodes locally, reconstructs the QR symbol, and exports the same
payload as SVG, PNG, PDF, or DOCX.

Live app: <https://tmrk.github.io/qr-recast/>

## What it does

- Scans one QR code or builds a named, reorderable batch.
- Recognises common payloads such as web addresses, Wi-Fi credentials, Matter and Apple Home setup
  codes, contacts, calendar events, email, SMS, telephone, geo, app, and crypto links.
- Preserves a trustworthy sampled module grid from suitable photographs, including the recovered QR
  version, mask, and error-correction level; falls back to a fresh canonical symbol when the sampled
  trace is not dependable.
- Adds optional type-aware labelling without altering the QR modules or quiet zone. Matter and Apple
  Home use purpose-built setup-card layouts; other types use a restrained utility label.
- Exports an individual QR or a two-column batch sheet as SVG, PNG, vector PDF, or DOCX with an SVG
  image and PNG compatibility fallback.
- Creates compressed share links with the payload in the URL fragment (`#q=`), which browsers do not
  send in the HTTP request. Existing `?q=` links remain readable for compatibility.
- Installs as a light/dark Progressive Web App and keeps its shell available offline after the first
  successful load.

## Privacy boundary

Decoding, QR reconstruction, branding, and export happen in the browser. Source photographs and
camera frames are never stored in batch state or uploaded by QR Recast. Batch names, payloads,
reconstruction metadata, and preferences stay in local storage on the device.

A share link necessarily contains a compressed copy of the payload, so anyone given that link can
recover it. QR Recast only sends analytics when a measurement ID is configured, Do Not Track is
off, and the user has not opted out. Analytics uses a fixed allowlist of coarse values and disables
automatic page-view collection; payload text, URL fragments, filenames, hashes, images, and exports
are excluded.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the data flow and storage model.

## Development

The project uses JavaScript and JSX, Node.js 24 or newer, and npm 11 or newer.

```sh
npm ci
npm run dev
```

Run the local code and build gate before committing:

```sh
npm run check
```

This checks formatting, ESLint, British English spelling, QR type fixtures, 47 unit tests, and the
production build. Individual commands and manual browser/export protocols are documented in
[TESTING.md](TESTING.md).

Three committed Playwright journeys exercise the mobile single-result/share/export flow, desktop
overflow, and a persisted seven-item batch with per-item output styles and every export format:

```sh
npm run test:e2e
```

## Delivery

Pull requests run the code gate and Playwright journeys on Node 24. A push to `main` runs both
again, uploads the production `dist/`, and deploys it through GitHub Pages Actions. See
[DEPLOYMENT.md](DEPLOYMENT.md).

## Licence

MIT. See [LICENCE](LICENCE).
