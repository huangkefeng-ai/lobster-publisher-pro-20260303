# Lobster Publisher Pro — Review Checklist

Use this checklist when reviewing PRs and before merging to `main`.

---

## 1. Code Quality

- [ ] TypeScript strict mode passes (`noImplicitAny`, `strictNullChecks`)
- [ ] No `any` types without a justifying comment
- [ ] No `eslint-disable` without a justifying comment
- [ ] No `console.log` left in production code (use structured logger)
- [ ] No hardcoded strings — use `constants.ts` or i18n keys
- [ ] Functions are ≤ 50 lines; files are ≤ 300 lines
- [ ] No circular imports (enforced by ESLint plugin)

---

## 2. Module Boundaries

- [ ] Changes stay within the declared module boundary (see ARCH_PLAN.md §3)
- [ ] Cross-module imports go through barrel `index.ts` exports only
- [ ] No UI module (`editor/`, `preview/`) imports from `export/` directly
- [ ] `core/` has zero React dependencies
- [ ] `themes/` has zero runtime JS — CSS only
- [ ] `wechat/` does not import `core/` internals (only consumes rendered HTML)
- [ ] `images/` remains standalone with no upstream dependencies

---

## 3. Markdown Pipeline (core/)

- [ ] All transforms are implemented as unified/remark/rehype plugins
- [ ] Pipeline is composable — plugins can be added/removed without side effects
- [ ] Magic paste correctly handles: bold, italic, links, images, lists, code blocks, tables
- [ ] Output HTML is valid and well-formed
- [ ] No XSS vectors in rendered output (sanitized by default)

---

## 4. Theme Engine (themes/)

- [ ] New themes are pure CSS — no JavaScript
- [ ] Theme CSS is scoped (no global leaks)
- [ ] Theme renders identically in preview and in WeChat paste
- [ ] Theme file follows naming convention: `kebab-case.css`
- [ ] Theme is registered in `registry.ts`
- [ ] Theme preview thumbnail exists

---

## 5. WeChat Compatibility (wechat/)

- [ ] All CSS classes are converted to inline styles before clipboard copy
- [ ] `<style>`, `<script>`, `<link>` tags are stripped
- [ ] Unsupported HTML elements are replaced with safe alternatives
- [ ] Images are base64-embedded (no external URLs)
- [ ] Output renders correctly when pasted into WeChat Mac/Windows editor
- [ ] Tested with at least 3 different themes

---

## 6. Export (export/)

- [ ] HTML export produces a standalone file (embedded CSS, no external deps)
- [ ] PDF export matches the live preview visually
- [ ] PDF export handles CJK characters correctly
- [ ] Export API route validates input and returns proper error codes
- [ ] Large documents (10k+ words) export without timeout

---

## 7. Image Handling (images/)

- [ ] Drag-and-drop upload works
- [ ] Paste image from clipboard works
- [ ] Images are compressed before embedding (max 1MB per image)
- [ ] Supported formats: PNG, JPEG, GIF, WebP
- [ ] Invalid/oversized files show user-friendly error messages
- [ ] No image data leaks to external services

---

## 8. Editor & Preview UI

- [ ] Editor and preview panes resize correctly
- [ ] Live preview updates within 100ms of edit
- [ ] Toolbar buttons reflect current formatting state
- [ ] Keyboard shortcuts work (Ctrl/Cmd+B, I, K, etc.)
- [ ] Paste handler intercepts rich text and converts to markdown
- [ ] Theme picker shows accurate previews
- [ ] Export buttons show loading state during generation
- [ ] UI is accessible (keyboard navigable, proper ARIA labels)

---

## 9. Testing

- [ ] New code has unit tests (≥ 80% line coverage for changed files)
- [ ] Core pipeline changes have integration tests
- [ ] WeChat output changes have snapshot tests
- [ ] UI changes have component tests (React Testing Library)
- [ ] Critical user flows have E2E tests (Playwright)
- [ ] All tests pass locally before PR submission
- [ ] No skipped tests (`it.skip`, `describe.skip`) without a linked issue

---

## 10. Security

- [ ] No user input rendered as raw HTML without sanitization
- [ ] No `dangerouslySetInnerHTML` without DOMPurify sanitization
- [ ] File uploads are validated (type, size) server-side
- [ ] API routes have proper input validation
- [ ] No secrets or API keys in committed code
- [ ] Dependencies have no known critical CVEs (`pnpm audit`)

---

## 11. Performance

- [ ] Markdown rendering is debounced (≥ 150ms delay)
- [ ] Large documents (10k+ words) don't freeze the UI
- [ ] Images are lazy-loaded in preview
- [ ] No unnecessary re-renders (React DevTools profiler check)
- [ ] Bundle size stays under 500KB gzipped

---

## 12. Documentation

- [ ] New modules have a brief README or JSDoc on exported functions
- [ ] Breaking changes are noted in PR description
- [ ] New theme contributions include a screenshot
- [ ] API changes update relevant type definitions

---

## 13. Git & CI

- [ ] Commit messages follow conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- [ ] PR targets `main` branch
- [ ] CI pipeline passes (lint → test → build)
- [ ] No merge conflicts
- [ ] PR description explains the "why", not just the "what"

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
