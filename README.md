# QR Recast

QR Recast is a client-only Progressive Web App for photographing a QR code and re-emitting it as
crisp SVG, PNG, PDF, and DOCX files.

Photos and QR contents never leave your device. Decoding, QR generation, and export work happen in
the browser.

Live app: <https://tmrk.github.io/qr-recast/>

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
