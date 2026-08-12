# QR Recast Agent Contract

## Product Intent

QR Recast makes photographed QR codes useful again. It is a private, on-device PWA that decodes a
photograph or camera frame, reconstructs a dependable QR symbol, and exports or shares the same
payload from `https://tmrk.github.io/qr-recast/`.

## Scope and Authority

- Treat the user's current request as the source of scope. `ROADMAP.md` supplies product context; it
  does not override a direct request or require unrelated roadmap work.
- Inspect `git status` before editing. Preserve user changes and untracked files, and do not rewrite,
  delete, stage, or commit work outside the requested scope.
- A request to review, explain, or diagnose does not authorise implementation, commits, pushes,
  deployments, external messages, or other consequential actions.
- Commit, push, deploy, or change remote state only when the user explicitly requests it. Follow the
  branch policy supplied by the active environment or task.
- Stop and ask when a missing choice would materially change the result, or when completion requires
  broader authority, credentials, destructive work, or an external dependency that is unavailable.
- Report only checks that actually ran. State any unverified browser, device, export, or deployment
  behaviour plainly.

## Engineering Rules

- Use JavaScript and JSX for app source. Do not introduce TypeScript or `tsconfig.json`.
- Write British English in user-facing strings, comments, commit messages, and Markdown.
- Design mobile-first at 360 px, then add deliberate desktop spacing. Preserve light and dark modes,
  accessible interaction, reduced-motion preferences, and native-feeling PWA behaviour.
- Use the existing Material UI and Material 3-inspired token system. Extend the product's visual
  language instead of dropping in a generic dashboard or component-library composition.
- Keep committed code free of `console.log`, dead code, commented-out blocks, ignored errors, and
  unowned TODOs.
- Prefer focused changes and established project abstractions. Add dependencies only when they earn
  their maintenance and bundle cost.

## Product Invariants

- QR type detectors are pure registry functions. They accept only decoded text, do not mutate state,
  never throw for arbitrary input, and have fixture or unit-test coverage.
- The decoded payload is canonical. Every preview, shared URL, and SVG, PNG, PDF, or DOCX export must
  represent that payload without silent alteration.
- Branding decorates canonical QR artwork. It remains user-toggleable and must preserve the quiet
  zone, finder patterns, module geometry, contrast, and practical scannability in every export.
- Batch state may store payloads, names, ordering, type metadata, branding state, and timestamps.
  Never store source photographs or camera frames.
- Batch, branding, analytics, and colour-scheme preferences use independent storage keys. Use a
  versioned key and an explicit migration whenever a stored schema changes.
- Type display and exports fail soft: classify only with evidence, show raw payloads when parsing is
  under-specified, and never invent structured values.
- Analytics and advertising code never receives payload text, generated share URLs, hashes,
  filenames, image data, or exported document content.

## Working Loop

1. Read this contract and the files directly relevant to the request. Consult `ROADMAP.md`,
   `ARCHITECTURE.md`, `TESTING.md`, or `DEPLOYMENT.md` when the change touches those concerns.
2. Inspect repository state and identify existing user work before editing.
3. Plan the smallest coherent change, implement it, and keep documentation aligned when behaviour or
   project procedure changes.
4. Run the evidence gates that match the change.
5. Review the final diff for scope, privacy, accessibility, failure states, and accidental churn.
6. Report the result, checks run, remaining risks, and any manual verification still required.

Use `PROGRESS.md`, `RECENT_CHANGES.md`, and roadmap checkboxes only when the task calls for project
tracking or the update would provide durable, non-duplicative context.

## Evidence Gates

- App code, dependency, build, or tooling changes: run `npm run check`.
- Focused logic changes: run or add the smallest relevant unit tests as well as the full check.
- User-journey changes: exercise the affected flow in a browser at 360 px and at a desktop width;
  check both colour schemes when styling is affected.
- Camera, native sharing, installation, and PWA lifecycle changes: verify on a suitable real device
  when that evidence is required and available. Otherwise record the gap for follow-up.
- Export changes: inspect every affected format, confirm the payload and filename, and decode the
  rendered QR output where practical.
- End-to-end tests are valuable for stable browser journeys, but they do not replace camera,
  installed-PWA, native-share, or downloaded-file checks on the platforms concerned.
- Documentation-only changes may use targeted formatting and spelling checks instead of rebuilding
  the app, unless the documentation describes a changed command or build path that should be proven.

## Git and Delivery

- Use small, atomic Conventional Commits in imperative mood and British English, for example
  `fix: preserve the QR quiet zone` or `ci: verify pull requests on Node 24`.
- Never push directly to the Pages deployment branch; GitHub Actions owns it.
- A push to `main` starts the Pages deployment workflow. Confirm the Actions run and deployed URL
  only when deployment is part of the authorised task.

## Local Commands

Use `npm ci` for a clean checkout and `npm install` only when intentionally changing dependencies.

```sh
npm ci
npm run dev
npm run check
npm run test:unit
npm run preview
```

## Secrets

Local values belong in `.env.local`, which is gitignored. Commit `.env.example` only with safe,
non-secret defaults. Values prefixed with `VITE_` are bundled into public client code; never place a
confidential credential in them, even when GitHub stores the source value as an Actions secret.
