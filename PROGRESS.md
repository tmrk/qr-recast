# QR Recast Progress

This log is append-only. New entries go at the bottom.

## 2026-05-28

- Plan: create the Phase 0 project documents, then initialise the repository and Phase 1 skeleton.
- Implemented the Vite React skeleton, dependency set, PWA base path, linting, formatting, spelling
  check, husky hook, GitHub Pages workflow, and local preview verification.
- Verified the first deployed GitHub Pages build returned HTTP 200 at
  `https://tmrk.github.io/qr-recast/`; updating Pages action majors to avoid runtime deprecation
  annotations before marking Phase 1 complete.
- Completed Phase 1 after workflow run `26573447472` passed and the deployed placeholder returned
  HTTP 200 with the expected `/qr-recast/` manifest scope.
- Plan: build the Phase 2 foundation with MUI CSS variables theming, app shell, router, PWA
  manifest source, generated icons, and theme-colour handling.
- Implemented the Phase 2 shell locally, generated the full icon set, captured light and dark
  preview screenshots, and measured a Lighthouse 11.7.1 PWA score of 100 on local preview.
- Completed Phase 2 after workflow run `26573960339` passed and the deployed
  `https://tmrk.github.io/qr-recast/` Lighthouse 11.7.1 PWA score was 100.
- Plan: implement the Phase 3 camera viewfinder, user-gesture camera start, upload fallback,
  downscaled QR decode loop, permission states, and in-memory detection handoff.
- Implemented the Phase 3 camera viewfinder and verified local upload decoding with a generated QR
  plus fake-camera readiness in Playwright; real mobile camera verification is still pending after
  deployment.
- Verified workflow run `26575176325` deployed the Phase 3 camera build; deployed upload decoding
  and fake-camera readiness passed, while real mobile camera verification remains pending.
