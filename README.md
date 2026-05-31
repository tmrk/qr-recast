# QR Recast

QR Recast is a client-only Progressive Web App for photographing a QR code and re-emitting it as
crisp SVG, PNG, PDF, and DOCX files.

Photos and QR contents never leave your device. Decoding, QR generation, and export work happen in
the browser.

Live app: <https://tmrk.github.io/qr-recast/>

## v2 Roadmap

QR Recast v2 adds three connected capabilities:

- Type recognition for common QR payloads including web addresses, Wi-Fi networks, Apple Home
  accessories, Matter setup codes, email, SMS, telephone, geo, contacts, calendar events, app links,
  crypto links, and plain text.
- Optional neutral vector branding around the re-cast QR, on by default and user-toggleable, so
  exported codes are easier to identify while staying scannable and offline-safe.
- Batch Recast for capturing, naming, reordering, persisting, and exporting multiple QR codes as
  tidy two-column SVG, PNG, PDF, and DOCX documents.

Batch progress is stored only in your browser localStorage on your device; source photos, QR
contents, names, and batch metadata are not sent to a server.

Settings keeps branding, Batch Recast management, analytics opt-out, version/build details, and the
on-device privacy note in one place.

## Development

```sh
npm install
npm run dev
```

## Checks

```sh
npm run lint
npm run build
npm run format:check
```

## Deployment

Every push to `main` runs linting and a production build, then deploys `dist/` to GitHub Pages via
GitHub Actions.

## Licence

MIT. See `LICENCE`.
