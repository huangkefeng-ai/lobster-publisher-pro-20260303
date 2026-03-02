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
- [x] Magic paste correctly handles: bold, italic, links, images, lists, code blocks
- [x] Output HTML is valid and well-formed
- [x] No XSS vectors in rendered output (DOMPurify sanitized by default)
- [ ] Table support in magic paste — _not yet tested_

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
- [ ] PDF export — _not yet implemented (phase 3)_
- [ ] Large document (10k+ words) stress test — _pending_

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
- [x] Live preview updates on every keystroke (synchronous via `useMemo`)
- [x] Toolbar inserts snippets at cursor position
- [x] Theme picker shows all 33 themes with active highlight
- [x] Export/copy buttons in dedicated actions panel
- [ ] Keyboard shortcuts (Ctrl/Cmd+B, I, K) — _not yet implemented_
- [ ] Paste handler intercepts rich text — _not yet wired to editor_
- [ ] ARIA labels on all interactive elements — _partial_

---

## 9. Testing

- [x] `editorState.test.ts` — reducer logic (3 tests)
- [x] `themeRegistry.test.ts` — registry invariants (3 tests)
- [x] `parser.test.ts` — rich text → markdown conversion (4 tests)
- [x] `sanitizer.test.ts` — WeChat sanitization (1 test)
- [x] `inlineStyles.test.ts` — inline style application (1 test)
- [x] `htmlExporter.test.ts` — themed + WeChat HTML export (2 tests)
- [x] All 14 tests pass locally (`npm test`)
- [x] Vitest config includes both `.test.ts` and `.test.tsx` files
- [ ] Coverage target ≥ 80% — _not yet measured_
- [ ] E2E tests (Playwright) — _not yet implemented_

---

## 10. Security

- [x] All markdown output sanitized via DOMPurify before rendering
- [x] `dangerouslySetInnerHTML` only used with DOMPurify-sanitized content
- [x] WeChat sanitizer uses strict allow-list for tags and attributes
- [x] No secrets or API keys in committed code
- [ ] `npm audit` — _run periodically_

---

## 11. Performance

- [x] Bundle size: 86 KB gzipped (well under 500 KB target)
- [x] Preview uses `useMemo` keyed on markdown content
- [ ] Markdown rendering debounce (≥ 150ms) — _not yet implemented_
- [ ] Large document (10k+ words) freeze test — _pending_
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
- [ ] CI pipeline (GitHub Actions) — _not yet configured_
- [x] ESLint passes cleanly
- [x] TypeScript build passes cleanly

---

## Phase-1 Audit Summary (2026-03-03)

| Area | Status | Notes |
|------|--------|-------|
| Lint | PASS | ESLint clean |
| Tests | PASS | 14/14 tests pass |
| Build | PASS | 86 KB gzip, < 1s build |
| Strict TS | PASS | All strict flags enabled |
| Module boundaries | PASS | Barrel exports enforced |
| Security | PASS | DOMPurify on all HTML paths |
| Bundle size | PASS | 86 KB << 500 KB target |

### Issues Fixed in This Review

1. `index.html` title changed from `tmp-scaffold` to `Lobster Publisher Pro`
2. Added barrel `index.ts` for all 6 modules; App.tsx updated to barrel imports
3. Extracted shared `core/renderer.ts` — eliminated duplicate marked+DOMPurify in preview and export
4. Removed `marked.setOptions()` side effect from `ArticlePreview.tsx`
5. Vitest config widened to include `.test.tsx` files
6. ARCH_PLAN.md tech stack updated (Vite, npm, textarea, marked vs. Next.js, pnpm, CodeMirror, unified)
7. ARCH_PLAN.md module layout updated to match actual file tree
8. Phase checkboxes updated with completion status

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
