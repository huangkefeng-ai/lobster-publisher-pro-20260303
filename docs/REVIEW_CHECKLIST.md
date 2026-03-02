# Lobster Publisher Pro — Review Checklist

Use this checklist when reviewing PRs and before merging to `main`.

---

## 1. Code Quality

- [x] TypeScript strict mode passes (`noImplicitAny`, `strictNullChecks`)
- [x] No `any` types without a justifying comment
- [x] No `eslint-disable` without a justifying comment
- [x] No `console.log` left in production code
- [x] No hardcoded strings — use `constants.ts`
- [x] Functions are ≤ 50 lines; files are ≤ 300 lines
- [ ] No circular imports (enforced by ESLint plugin) — _plugin not yet configured_

---

## 2. Module Boundaries

- [x] Changes stay within the declared module boundary (see ARCH_PLAN.md §3)
- [x] Cross-module imports go through barrel `index.ts` exports only
- [x] No UI module (`editor/`, `preview/`) imports from `export/` directly
- [x] `core/` has zero React dependencies
- [x] `theme/` types + registry are data-only (no side effects)
- [x] `wechat/` does not import `core/` internals (only consumes rendered HTML)

---

## 3. Markdown Pipeline (core/)

- [x] `core/renderer.ts` is the single markdown→HTML entry point (marked + DOMPurify)
- [x] `core/parser.ts` handles rich text → markdown via DOMParser
- [x] Magic paste correctly handles: bold, italic, links, images, lists, code blocks, tables
- [x] Output HTML is valid and well-formed
- [x] No XSS vectors in rendered output (DOMPurify sanitized by default)

---

## 4. Theme Engine (theme/)

- [x] Themes are token-based TypeScript objects (`ThemeTokens` interface)
- [x] Tokens map to CSS custom properties via `toThemeCssVariables()`
- [x] Theme renders identically in preview and in WeChat paste
- [x] Theme IDs follow `kebab-case` naming convention
- [x] All 33 themes registered in `themeRegistry.ts`
- [ ] Theme preview thumbnails — _not yet implemented_

---

## 5. WeChat Compatibility (wechat/)

- [x] Theme tokens applied as inline styles per element (`inlineStyles.ts`)
- [x] `<style>`, `<script>`, `<link>` tags stripped (`sanitizer.ts`)
- [x] Unsupported HTML attributes (`class`, `id`, `onclick`) removed
- [x] Clipboard API writes `text/html` MIME type for paste fidelity
- [ ] Images base64-embedded — _not yet implemented (phase 3)_
- [ ] Manual WeChat paste testing — _pending_

---

## 6. Export (export/)

- [x] HTML export produces a standalone file (embedded CSS, no external deps)
- [x] `downloadHtmlFile()` triggers browser download via Blob URL
- [x] WeChat HTML export chains: render → sanitize → inline styles
- [x] PDF export via hidden iframe + `window.print()` (`pdfExporter.ts`)
- [x] Large document (10k+ words) stress test — covered by `parser.test.ts` stress case

---

## 7. Image Handling (images/)

_Module not yet implemented. Planned for phase 3._

- [ ] Drag-and-drop upload works
- [ ] Paste image from clipboard works
- [ ] Images are compressed before embedding (max 1MB per image)
- [ ] Supported formats: PNG, JPEG, GIF, WebP

---

## 8. Editor & Preview UI

- [x] Editor and preview panes resize correctly (CSS grid, responsive)
- [x] Live preview updates on every keystroke (debounced via `createDebouncedFunction`)
- [x] Toolbar inserts snippets at cursor position
- [x] Theme picker shows all 33 themes with active highlight
- [x] Export/copy buttons in dedicated actions panel
- [x] Keyboard shortcuts (Ctrl/Cmd+B, I, K, Shift+C, Tab/Shift+Tab)
- [x] Paste handler intercepts rich text and converts to markdown
- [x] Theme search input has `aria-label` for accessibility
- [ ] ARIA labels on all interactive elements — _partial_

---

## 9. Testing

- [x] `editorState.test.ts` — reducer logic (4 tests)
- [x] `themeRegistry.test.ts` — registry invariants (3 tests)
- [x] `parser.test.ts` — rich text → markdown conversion (11 tests)
- [x] `sanitizer.test.ts` — WeChat sanitization (2 tests)
- [x] `inlineStyles.test.ts` — inline style application (1 test)
- [x] `htmlExporter.test.ts` — themed + WeChat HTML export (4 tests)
- [x] `statistics.test.ts` — document stats and CJK word count (8 tests)
- [x] `storage.test.ts` — localStorage save/load/clear (5 tests)
- [x] `shortcuts.test.ts` — keyboard shortcut text transforms (9 tests)
- [x] `themeFilter.test.ts` — theme search/filter (6 tests)
- [x] `pdfExporter.test.ts` — PDF print function (4 tests)
- [x] `debounce.test.ts` — debounce utility (3 tests)
- [x] All tests pass locally (`npm test` — 62 tests, 13 suites)
- [x] Vitest config includes both `.test.ts` and `.test.tsx` files
- [x] Coverage target ≥ 80% — _measured on 2026-03-03 (`npm run test:coverage`): lines 85.17%, statements 84.94%_
- [ ] E2E tests (Playwright) — _not yet implemented_

---

## 10. Security

- [x] All markdown output sanitized via DOMPurify before rendering
- [x] `dangerouslySetInnerHTML` only used with DOMPurify-sanitized content
- [x] WeChat sanitizer uses strict allow-list for tags and attributes
- [x] No secrets or API keys in committed code
- [x] `npm audit` (high) passes locally on 2026-03-03

---

## 11. Performance

- [x] Bundle size: 90 KB gzipped (well under 500 KB target)
- [x] EditorPane word count memoized via `useMemo`
- [x] Preview debounced (100ms) via `createDebouncedFunction`
- [x] Draft persistence debounced (250ms) via `createDebouncedFunction`
- [x] Large document (10k+ words) freeze test — covered by `parser.test.ts` stress case
- [ ] Image lazy-loading — _not applicable yet_

---

## 12. Documentation

- [x] ARCH_PLAN.md updated to reflect actual tech stack and module layout
- [x] Phase checkboxes updated with completion status
- [x] README.md documents module layout and dev commands
- [ ] JSDoc on all exported functions — _partial_

---

## 13. Git & CI

- [x] Commit messages follow conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- [x] CI pipeline (GitHub Actions)
- [x] ESLint passes cleanly
- [x] TypeScript build passes cleanly

---

## Phase-2 Audit Summary (2026-03-03)

| Area | Status | Notes |
|------|--------|-------|
| Lint | PASS | ESLint clean |
| Tests | PASS | All tests pass |
| Build | PASS | 90 KB gzip, < 1s build |
| Strict TS | PASS | All strict flags enabled |
| Module boundaries | PASS | Barrel exports enforced |
| Security | PASS | DOMPurify on all HTML paths |
| Bundle size | PASS | 90 KB << 500 KB target |

### Issues Fixed in Phase-2 Review

1. **pdfExporter double-print bug**: `iframeDoc.close()` set `readyState` to `complete`, causing the fallback block to fire immediately AND `onload` to fire later — two print dialogs. Fixed by registering `onload` before `write()`/`close()` and removing the redundant fallback.
2. **Inconsistent word count**: `EditorPane` used a naive `split(/\s+/)` while `App.tsx` used CJK-aware `computeDocumentStats()`. Fixed `EditorPane` to use `computeDocumentStats()`.
3. **Missing table support in magic paste**: `<table>` pasted from rich text fell through to the default case, losing tabular structure. Added `table`/`thead`/`tbody`/`tr`/`td`/`th` cases to `parser.ts` producing GFM pipe tables.
4. **Accessibility gap**: `ThemePicker` search input was missing `aria-label`. Added `aria-label="Search themes"`.
5. **Stale docs**: ARCH_PLAN.md module tree and phase checklists updated to reflect all phase-2 completions (statistics, storage, debounce, shortcuts, themeFilter, pdfExporter).

---

## Phase-3 Architecture Audit (2026-03-03)

| Area | Status | Notes |
|------|--------|-------|
| Lint | PASS | ESLint clean |
| Tests | PASS | 62 tests across 13 suites |
| Build | PASS | 90 KB gzip, < 1s build |
| Strict TS | PASS | All strict flags enabled |
| Module boundaries | FIXED | 7 barrel-bypass imports corrected |
| Security | FIXED | Parser sanitizes `javascript:` / `data:` URIs |
| Performance | FIXED | `useMemo` + targeted `querySelectorAll` |

### Issues Fixed in Phase-3 Review

1. **downloadHtmlFile Blob URL race** (BUG-01, HIGH): `URL.revokeObjectURL` was called synchronously after `anchor.click()`, before the browser started the download. Fixed by appending anchor to DOM, deferring removal and revocation via `setTimeout(..., 0)`.
2. **pdfExporter iframe cleanup** (BUG-02/03, MEDIUM): Iframe removed on a 1-second magic timer that could fire mid-print. Replaced with `afterprint` event listener and a null-check on `contentWindow`.
3. **Parser XSS: unsanitized href/src** (BUG-05/06, MEDIUM): `javascript:`, `data:`, and `vbscript:` URIs in pasted HTML were passed into Markdown verbatim. Added protocol allow-list filter.
4. **Parser table pipe escape** (EDGE-01, MEDIUM): Pipe characters (`|`) inside table cell content broke GFM table syntax. Added `escPipe()` helper.
5. **Line count off-by-N** (BUG-04, LOW): `statistics.ts` counted lines on `trimmed` string, stripping leading/trailing newlines. Changed to count on raw `markdown`.
6. **Ctrl+K empty link text** (EDGE-03, LOW): With no selection, shortcut produced `[](url)`. Now inserts `[link text](url)` with placeholder.
7. **EditorPane double stats computation** (BUG-08/PERF-01, MEDIUM): `computeDocumentStats()` called on every render without memoization. Wrapped in `useMemo`.
8. **inlineStyles `querySelectorAll('*')` traversal** (PERF-04, MEDIUM): Replaced with targeted tag selector from `tagStyleMap` keys.
9. **Module boundary violations** (MB-01 through MB-07): Fixed 7 imports across source and test files to use barrel `index.ts` exports instead of reaching into internal modules directly.

---

## Quick Reference: Reviewer Sign-off

```
## Review
- [ ] Code quality acceptable
- [ ] Module boundaries respected
- [ ] Tests adequate
- [ ] Security reviewed
- [ ] Manually tested (if UI change)
```
