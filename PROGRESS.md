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
- Plan: complete the scan handoff by replacing the temporary detection screen with the Phase 4
  result view, canonical QR generation, and SVG, PNG, PDF, and DOCX exports.
- Implemented the Phase 4 result view, removed the temporary scan completion screen, and verified
  local preview downloads for SVG, PNG, PDF, and DOCX. Fixed DOCX generation by passing UTF-8 SVG
  bytes to `docx` with the PNG fallback intact.
- Added the Phase 3 detected-polygon overlay so successful camera scans visibly snap to the QR
  shape before handing off to the Result view.
- Completed Phase 3 and Phase 4 after workflow run `26596003511` passed and the deployed
  `https://tmrk.github.io/qr-recast/` smoke test downloaded SVG, PNG, PDF, and DOCX exports and
  copied a production share URL.

## 2026-05-29

- Plan: formalise Phase 5 compressed share URL encoding and verify the generated `?q=` link.
- Completed the compressed share URL helper, verified local preview returned HTTP 200, and confirmed
  a sample payload round-tripped through `lz-string` without exposing the plain payload in the URL.
- Plan: disable Phase 5 URL sharing when the compressed link exceeds 2000 characters and show inline
  guidance.
- Completed the URL length guard with the disabled Share URL action and inline guidance; lint, build,
  and local preview Playwright checks passed for short and long QR payloads.
- Plan: make Phase 5 URL actions use native mobile sharing when available and desktop clipboard
  copying otherwise.
- Completed the responsive URL action: desktop copies the generated `?q=` URL, while mobile-style
  browsers with Web Share available use native sharing.
- Plan: add the Phase 5 desktop copied URL pill and secondary QR preview after successful URL
  copying.
- Completed the desktop copied URL pill and secondary share-link QR preview; local preview verified
  it appears only after desktop copying and stays hidden on the mobile native-share path.
- Plan: add the Phase 5 copied-state icon morph, success colour, and subtle scale animation to the
  URL copy action.
- Completed the URL copy feedback with a check icon morph, success button colour, and subtle scale
  animation; local preview verified the copied state and mobile native-share separation.
- Plan: load valid Phase 5 `?q=` payloads directly into the Result view and replace the URL without
  the query string.
- Completed direct `?q=` loading: valid shared URLs open the Result view and clear the query string,
  while invalid payloads clear back to the scanner.
- Plan: make the decoded text panel open as a mobile bottom sheet while keeping the desktop dialog.
- Completed the responsive decoded text container; local preview verified the desktop dialog and
  mobile bottom sheet both show the decoded payload.
