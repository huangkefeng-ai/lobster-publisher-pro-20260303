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

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pipeline `Result` type conflicts with existing throw-based code in clipboard/export | Medium | Pipeline catches at boundary; existing code unchanged |
| WeChat editor strips `<span>` tags | Low | Fallback: `<del>` is also whitelisted |
| Large markdown (>500KB) may slow pipeline | Low | Validator enforces 500KB limit |
| DOMParser not available in test env | Medium | Already solved: vitest uses jsdom |

---

## Verification Commands

```bash
npm run lint          # ESLint — zero errors
npm run test          # Vitest — all pass
npm run build         # tsc + vite — clean output
```
