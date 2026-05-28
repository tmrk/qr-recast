# Contributing

## Development Setup

```sh
npm install
npm run dev
```

Useful commands:

```sh
npm run lint
npm run build
npm run preview
npm run format
npm run format:check
npm run check:spelling
```

## Conventions

- App source is JavaScript and JSX only.
- User-facing strings live in `src/strings.js`.
- British English is required in copy, comments, commit messages, and Markdown.
- Components should stay focused and readable. Split files that grow beyond a clear single
  responsibility.
- Async UI must expose pending, success, cancellation, and error states.
- Keep `catch` blocks meaningful. Use the app logger once it exists.

## Commit Style

Use Conventional Commits in imperative mood:

- `feat: add QR export actions`
- `fix: respect reduced motion in scanner`
- `docs: update deployment notes`
- `ci: publish Pages artefact`

Keep commits atomic and push frequently to `main`.

## Pull Request Checklist

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `npm run format:check` passes.
- [ ] Relevant docs are updated.
- [ ] UI changes are checked in a browser.
- [ ] Camera, share, or PWA changes are checked on a real mobile device.
