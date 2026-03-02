# Lobster Publisher Pro — V2 Development Plan

## Overview

V2 builds on the Phase-1 foundation (editor, themes, basic export) to deliver a **production-grade publish pipeline** with structured error handling, input validation, and a composable step-based architecture that is fully testable without browser dependencies.

---

## Team Responsibilities

| Role | Agent | Scope |
|------|-------|-------|
| **Architect + Core Logic** | Claude (Opus 4.6) | Pipeline, errors, validation, parser fixes, dev plan |
| **Code Review + Unit Tests** | Codex | Test coverage for all new modules, review PRs |
| **UI/UX + E2E** | Gemini | Theme UI, preview polish, browser-use E2E tests |

---

## Phase 2 Scope

### In Scope (this round)

1. **Typed Error System** (`src/core/errors.ts`)
   - `PublishError` class with machine-readable `code` enum
   - `Result<T>` type for pipeline-safe error propagation (no thrown exceptions in pipeline)
   - Error codes: `EMPTY_INPUT`, `RENDER_FAILED`, `SANITIZE_FAILED`, `CLIPBOARD_FAILED`, `EXPORT_FAILED`, `VALIDATION_FAILED`, `IMAGE_TOO_LARGE`

2. **Input Validation** (`src/core/validator.ts`)
   - `validateMarkdown()` — checks emptiness, max length, returns `Result`
   - `validateImageFile()` — checks file type, file size limits
   - Pure functions, no DOM dependency

3. **Publish Pipeline** (`src/pipeline/`)
   - `PipelineContext` type carrying markdown + theme + options through steps
   - `PipelineStep<T>` — composable, individually testable step interface
   - `runPipeline()` — orchestrates steps with early-exit on error
   - Pre-built pipelines: `wechatPipeline()`, `htmlExportPipeline()`, `pdfPrintPipeline()`
   - Each pipeline returns `Result<PipelineOutput>` instead of throwing

4. **WeChat Compatibility Fixes**
   - Add `del`, `s`, `strike`, `span` to sanitizer allowed tags
   - Add `text-decoration` to sanitizer allowed attributes
   - Add strikethrough inline styles in `inlineStyles.ts`

5. **Barrel Export Updates** — clean public API surface

### Out of Scope (deferred)

- Drag-and-drop image upload UI (Gemini scope)
- Theme creation/customization UI (Gemini scope)
- Server-side rendering / SSR
- WeChat API direct publishing (future Phase 3)
- i18n / l10n
- Plugin system

---

## Architecture

```
User Input (markdown)
    │
    ▼
┌──────────────┐
│  Validator    │ ── validateMarkdown() → Result
└──────┬───────┘
       │ ok
       ▼
┌──────────────┐
│  Renderer    │ ── renderMarkdownToHtml() → html string
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Sanitizer   │ ── sanitizeWechatHtml() → clean html
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ InlineStyles │ ── applyWechatInlineStyles() → styled html
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Clipboard / │ ── copyWechatHtmlToClipboard()
│  Export      │    downloadHtmlFile()
└──────────────┘    printThemedArticle()
```

Pipeline wraps these into composable `PipelineStep` objects with `Result<T>` flow.

---

## File Inventory (new/modified)

| File | Action | Purpose |
|------|--------|---------|
| `docs/DEV_PLAN_V2.md` | **new** | This plan |
| `src/core/errors.ts` | **new** | Typed errors + Result type |
| `src/core/validator.ts` | **new** | Input validation functions |
| `src/core/index.ts` | **modified** | Export new modules |
| `src/pipeline/types.ts` | **new** | Pipeline step/context types |
| `src/pipeline/steps.ts` | **new** | Individual pipeline steps |
| `src/pipeline/runner.ts` | **new** | Pipeline orchestration |
| `src/pipeline/pipelines.ts` | **new** | Pre-built pipeline factories |
| `src/pipeline/index.ts` | **new** | Barrel exports |
| `src/wechat/sanitizer.ts` | **modified** | Add del/s/strike/span tags |
| `src/wechat/inlineStyles.ts` | **modified** | Strikethrough styles |

---

## Acceptance Criteria

- [ ] `npm run lint` passes with zero errors
- [ ] `npm run test` passes — all existing + new tests green
- [ ] `npm run build` produces clean `dist/` output
- [ ] `PublishError` is a proper `Error` subclass with `.code` and `.toJSON()`
- [ ] `validateMarkdown()` rejects empty and oversized input
- [ ] `validateImageFile()` rejects non-image MIME types and files > 10MB
- [ ] `runPipeline()` short-circuits on first step error
- [ ] `wechatPipeline()` produces sanitized, inline-styled HTML
- [ ] WeChat sanitizer allows `<del>`, `<s>`, `<strike>`, `<span>` tags
- [ ] Strikethrough text renders with `text-decoration: line-through` in WeChat output
- [ ] All new functions are pure (no side effects) or clearly documented
- [ ] All new modules have JSDoc on exported members for Codex test generation

---

## Raphael-Publish Reference Alignment

Cross-referenced against raphael-publish (WeChat article layout tool) to identify feature gaps.

### Adopted (this round)

| Feature | raphael-publish | lobster-publisher-pro | Notes |
|---------|----------------|----------------------|-------|
| Span-based bold/italic/strike (Feishu, Notion, Word) | Inline style detection | `renderSpanWithStyles()` in `parser.ts` | Detects `font-weight`, `font-style`, `text-decoration` on `<span>` |
| `<strike>` tag support | Handled | Added to `renderNode` switch + sanitizer whitelist | Alongside `<del>` and `<s>` |
| Checkbox task lists (Notion paste) | Checkbox → `- [x]`/`- [ ]` | `extractCheckbox()` in `renderList` | Reads `<input type="checkbox" checked>` inside `<li>` |
| Code block language hint | `<pre><code class="language-X">` | Language extracted from class, emitted as ` ```X ` | Feishu and Notion paste this format |
| `<figure>` / `<figcaption>` | Image + caption | `<figure>` passes through, `<figcaption>` → `*caption*` | Common in Notion exports |
| Ordered list `start` attribute | Respected | `ol[start]` → correct numbering | Word and Feishu paste use `start="N"` |
| Table `colspan` expansion | Repeated cell | Cell duplicated for each spanned column | Word/Feishu paste merged cells |
| `<mark>`, `<u>`, `<ins>`, `<sub>`, `<sup>`, `<abbr>` | Pass-through text | Pass-through (no markdown equivalent) | Prevents silent content loss |
| Word `<head>` / `<meta>` / `<style>` stripping | Suppressed | Added to ignore list in `renderNode` | Word pastes full HTML documents |

### Deferred (future rounds)

| Feature | Reason |
|---------|--------|
| Footnote conversion (`<sup>` → `[^N]`) | Requires multi-pass: collect footnotes, then append definitions |
| Custom highlight syntax (`<mark>` → `==text==`) | Not standard GFM; would break standard renderers |
| Image proxy / upload to WeChat CDN | Requires server-side component; out of client-only scope |
| Table alignment detection (`text-align` → `:---:`) | Low priority; WeChat editor ignores alignment anyway |
| Nested blockquote depth (`> > >`) | raphael-publish doesn't handle this either; rare in paste |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pipeline `Result` type conflicts with existing throw-based code in clipboard/export | Medium | Pipeline catches at boundary; existing code unchanged |
| WeChat editor strips `<span>` tags | Low | Fallback: `<del>` is also whitelisted |
| Large markdown (>500KB) may slow pipeline | Low | Validator enforces 500KB limit |
| DOMParser not available in test env | Medium | Already solved: vitest uses jsdom |

---

## Handoff: Codex Gate-Check Checklist

Codex is responsible for **code review and unit-test quality gates** on all V2 modules.
Run these checks before approving any PR that touches core logic or pipeline code.

### Must-verify (unit tests)

| Module | What to gate-check |
|--------|--------------------|
| `src/core/errors.ts` | `PublishError` is a true `Error` subclass (`instanceof` works). `toJSON()` returns `{ name, code, message }`. `ok()` / `err()` produce correct discriminated unions. |
| `src/core/validator.ts` | `validateMarkdown('')` → `EMPTY_INPUT`. Input at exactly 512 000 bytes passes; 512 001 fails with `VALIDATION_FAILED`. Multi-byte (CJK) byte counting is correct. `validateImageFile` rejects non-image MIME and files > 10 MB. |
| `src/pipeline/runner.ts` | `runPipeline` short-circuits: second step must never execute after first fails. Empty step list returns `ok` with empty html. Context threads correctly across steps. |
| `src/pipeline/steps.ts` | Each step (`validateStep`, `renderStep`, `sanitizeWechatStep`, `inlineStyleStep`) returns `err` when preconditions are missing (e.g. `ctx.html` undefined). `sanitizeWechatStep` strips `<script>` tags. `inlineStyleStep` sets `styledHtml` on context. |
| `src/pipeline/pipelines.ts` | `wechatPipeline` returns `target: 'wechat'` with inline-styled HTML. `htmlExportPipeline` returns `target: 'html-export'`. `pdfPrintPipeline` returns `target: 'pdf-print'`. All three reject empty markdown without throwing. |

### Code-review gates

- No `any` types in new code.
- All exported functions have JSDoc.
- No circular imports (`import/no-cycle` rule enforced).
- `Result<T>` is used instead of `throw` in pipeline paths.
- Tests are deterministic — no `setTimeout`, no network, no filesystem.

### Verification command

```bash
npm run lint && npm run test && npm run build
```

---

## Handoff: Gemini E2E-Check Checklist

Gemini is responsible for **browser-level E2E** using Playwright / browser-use.
These checks verify the full user-facing flow, not individual functions.

### Must-verify (E2E scenarios)

| Scenario | Steps | Expected outcome |
|----------|-------|------------------|
| **WeChat copy** | Type markdown → click "Copy WeChat HTML" | Clipboard contains `<section>` with inline `style=` attributes. No `<script>` tags. Strikethrough text (`~~deleted~~`) has `text-decoration: line-through`. |
| **HTML export** | Type markdown → click "Export HTML" | Browser downloads `.html` file. File contains `<!doctype html>`, theme CSS variables, rendered markdown. |
| **PDF print** | Type markdown → click "Print / Save PDF" | Print dialog opens (or iframe is created and `window.print()` is called). |
| **Empty editor guard** | Clear editor → click "Copy WeChat HTML" | Status toast shows error message (not a crash / unhandled exception). |
| **Theme switch** | Select different theme → check preview | Preview background color and heading color update to match selected theme tokens. |
| **Large paste** | Paste 10 000-word HTML into editor | Editor renders within 4 s. No freeze. Stats bar updates. |
| **Strikethrough rendering** | Type `~~struck~~` in editor | Preview shows text with visible line-through decoration. |

### UI files Gemini owns

- `src/App.tsx` — pipeline integration point (currently uses direct exports; migrate to `wechatPipeline()` / `htmlExportPipeline()` / `pdfPrintPipeline()` when ready).
- `src/editor/components/EditorPane.tsx`
- `src/preview/components/ArticlePreview.tsx`
- `src/theme/ThemePicker.tsx`
- `src/App.css`, `src/index.css`

### Verification command

```bash
npx playwright test          # E2E suite
```

---

## API Surface Reference

### `src/core` barrel (`src/core/index.ts`)

| Export | Kind | Source |
|--------|------|--------|
| `DEFAULT_MARKDOWN`, `DEFAULT_THEME_ID` | const | `constants.ts` |
| `createDebouncedFunction` | fn | `debounce.ts` |
| `DebouncedFunction` | type | `debounce.ts` |
| `PublishError`, `PublishErrorCode`, `ok`, `err` | class/const/fn | `errors.ts` |
| `Result` | type | `errors.ts` |
| `richTextToMarkdown`, `markdownFromClipboard` | fn | `parser.ts` |
| `renderMarkdownToHtml` | fn | `renderer.ts` |
| `computeDocumentStats` | fn | `statistics.ts` |
| `DocumentStats` | type | `statistics.ts` |
| `saveEditorDraft`, `loadEditorDraft`, `clearEditorDraft` | fn | `storage.ts` |
| `EditorDraft` | type | `storage.ts` |
| `validateMarkdown`, `validateImageFile` | fn | `validator.ts` |

### `src/pipeline` barrel (`src/pipeline/index.ts`)

| Export | Kind | Source |
|--------|------|--------|
| `PipelineContext`, `PipelineOutput`, `PipelineStep` | type | `types.ts` |
| `runPipeline` | fn | `runner.ts` |
| `validateStep`, `renderStep`, `sanitizeWechatStep`, `inlineStyleStep` | const | `steps.ts` |
| `wechatPipeline`, `htmlExportPipeline`, `pdfPrintPipeline` | fn | `pipelines.ts` |

---

## Verification Commands

```bash
npm run lint          # ESLint — zero errors
npm run test          # Vitest — all pass
npm run build         # tsc + vite — clean output
```
