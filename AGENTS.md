# QR Recast Agent Contract

## Mission Statement

QR Recast exists to make photographed QR codes useful again: an elegant, privacy-preserving
Material-You PWA that decodes on-device, re-emits crisp SVG, PNG, PDF, and DOCX files, and can
share the same payload by URL from `https://tmrk.github.io/qr-recast/`.

## Golden Rules

- Use JavaScript and JSX only for app source. Do not introduce TypeScript or `tsconfig.json`.
- Write British English in user-facing strings, comments, commit messages, and Markdown.
- Design mobile-first at 360 px, then scale up with deliberate desktop spacing.
- Use Material UI with Material 3-inspired tokens, light and dark modes, and native-feeling PWA
  behaviour.
- Keep committed code free of `console.log`, dead code, commented-out blocks, and unowned TODOs.
- Keep prettier, eslint, spelling checks, and builds clean before every commit.

## Working Loop

1. Read `ROADMAP.md`.
2. Pick the next unchecked item in order.
3. Write a one-line plan in `PROGRESS.md`.
4. Implement the change.
5. Run `npm run lint` and `npm run build`.
6. Manually verify in a browser when the task changes UI.
7. Commit with a Conventional Commit message.
8. Push to `main`.
9. Confirm the deployment or local preview.
10. Tick the roadmap item and append the result to `RECENT_CHANGES.md`.

## Commit Style

Use Conventional Commits in imperative mood and British English:

- `feat: add camera permission states`
- `fix: correct GitHub Pages base path`
- `chore: configure lint-staged`
- `docs: document privacy guarantees`
- `refactor: simplify QR export helpers`
- `style: align result actions`
- `perf: lazy-load document exporters`
- `test: add URL payload validation cases`
- `ci: deploy Pages from main`

## Branching

Work trunk-based on `main`. Keep commits small and atomic. Push frequently so GitHub Actions can
deploy and reveal integration issues early. Do not push directly to the Pages branch; Actions owns
deployment.

## Definition of Done

A task is done only when:

- Code is committed and pushed.
- `npm run lint` and `npm run build` are clean.
- Relevant Markdown files are updated.
- The change is visible on the deployed site, or on a fresh local preview for non-user-facing work.
- Camera, sharing, and PWA-shell changes are manually checked on at least one real mobile device.
- British English spelling checks pass.
- There are no `console.log` calls, dead code, ignored errors, or unowned TODOs.

## How to Run Locally

```sh
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## Secrets

Local secrets live in `.env.local`, which is gitignored. Production keys are provided through
GitHub Actions repository secrets. Commit `.env.example` only, with empty values.

## Never Do This

- Do not introduce TypeScript in app code.
- Do not commit `.env*` files containing secrets.
- Do not push directly to the Pages deployment branch.
- Do not bypass linting, formatting, spelling checks, or builds.
- Do not use US spellings in app copy, comments, commit messages, or Markdown.
