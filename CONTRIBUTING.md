# Contributing

## Development Setup

```sh
npm ci
npm run dev
```

Useful commands:

```sh
npm run check
npm run lint
npm run build
npm run test:unit
npm run test:e2e
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

Keep commits atomic. Follow the branch and delivery scope of the active task; a push to `main`
starts the Pages deployment workflow.

## Pull Request Checklist

- [ ] `npm run check` passes.
- [ ] `npm run test:e2e` passes when browser journeys are affected.
- [ ] Behaviour or project-procedure changes are reflected in the relevant docs.
- [ ] UI changes are checked in a browser.
- [ ] Camera, native-share, or PWA changes are checked on a suitable real mobile device, or the
      outstanding manual check is recorded.
