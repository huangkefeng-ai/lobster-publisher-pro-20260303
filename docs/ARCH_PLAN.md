# Lobster Publisher Pro — Architecture Plan

## 1. Project Overview

An open-source WeChat article layout tool that converts rich text / markdown into beautifully styled, WeChat-compatible HTML. Targets content creators who publish via WeChat Official Accounts.

### Core Capabilities

| # | Feature | Priority |
|---|---------|----------|
| 1 | Magic paste (rich text → markdown) | P0 |
| 2 | 30+ style themes with live preview | P0 |
| 3 | WeChat-compatible HTML export | P0 |
| 4 | Copy-to-WeChat workflow | P0 |
| 5 | PDF / HTML file export | P1 |
| 6 | Image handling (upload, inline, base64) | P1 |

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Runtime | Node.js ≥ 20 | LTS, wide ecosystem |
| Language | TypeScript 5.x | Type safety across all modules |
| Framework | Next.js 14 (App Router) | SSR for preview, API routes for export |
| UI | React 18 + Tailwind CSS + shadcn/ui | Rapid theming, accessible components |
| Editor | CodeMirror 6 | Extensible markdown editor with syntax highlighting |
| Markdown → HTML | unified (remark + rehype) | Pluggable pipeline, battle-tested |
| PDF export | Puppeteer (headless Chrome) | Pixel-perfect PDF from rendered HTML |
| State | Zustand | Lightweight, no boilerplate |
| Testing | Vitest + React Testing Library + Playwright | Unit / integration / E2E |
| Package manager | pnpm | Fast, strict, workspace-ready |
| Linting | ESLint + Prettier | Consistent code style |
| CI | GitHub Actions | Lint → Test → Build on every PR |

---

## 3. Module Boundaries

The codebase is organized into **seven isolated modules**. Each module owns its types, logic, and tests. Cross-module imports go through explicit barrel exports (`index.ts`).

```
src/
├── core/                  # Module 1 — Markdown processing pipeline
│   ├── parser.ts          #   Rich text / HTML → Markdown (magic paste)
│   ├── transformer.ts     #   Markdown AST transforms (GFM, math, etc.)
│   ├── renderer.ts        #   Markdown → themed HTML
│   └── index.ts
│
├── themes/                # Module 2 — Theme engine
│   ├── engine.ts          #   CSS-in-JS theme application
│   ├── registry.ts        #   Theme discovery & loading
│   ├── presets/            #   30+ built-in theme CSS files
│   │   ├── elegant.css
│   │   ├── tech-dark.css
│   │   └── ...
│   └── index.ts
│
├── wechat/                # Module 3 — WeChat compatibility layer
│   ├── sanitizer.ts       #   Strip unsupported tags / attrs
│   ├── inline-styles.ts   #   Convert classes → inline styles
│   ├── clipboard.ts       #   Copy formatted HTML to clipboard
│   └── index.ts
│
├── export/                # Module 4 — Export engine
│   ├── html.ts            #   Standalone HTML file export
│   ├── pdf.ts             #   PDF generation via Puppeteer
│   └── index.ts
│
├── images/                # Module 5 — Image handling
│   ├── uploader.ts        #   Drag-and-drop / paste image upload
│   ├── processor.ts       #   Resize, compress, base64 encode
│   └── index.ts
│
├── editor/                # Module 6 — Editor UI
│   ├── Editor.tsx          #   CodeMirror wrapper component
│   ├── Toolbar.tsx         #   Formatting toolbar
│   ├── PasteHandler.tsx    #   Magic paste interception
│   └── index.ts
│
├── preview/               # Module 7 — Live preview
│   ├── Preview.tsx         #   Rendered HTML preview pane
│   ├── ThemePicker.tsx     #   Theme selection sidebar
│   ├── ExportBar.tsx       #   Export action buttons
│   └── index.ts
│
├── app/                   # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx            #   Main split-pane editor + preview
│   └── api/
│       └── export/
│           └── route.ts    #   POST /api/export — PDF/HTML generation
│
├── lib/                   # Shared utilities (no business logic)
│   ├── types.ts
│   ├── constants.ts
│   └── utils.ts
│
└── store/                 # Zustand stores
    ├── editor-store.ts
    └── theme-store.ts
```

### Module Dependency Graph

```
editor ──→ core ──→ themes
  │          │
  │          ▼
  │       wechat
  │          │
  ▼          ▼
preview    export
  │
  ▼
images
```

**Rules:**
- `core` depends on `themes` (to apply theme CSS during rendering).
- `wechat` depends on `core` output (rendered HTML) but NOT on `core` internals.
- `export` depends on `core` + `wechat` (generates final exportable artifacts).
- `editor` and `preview` are UI shells; they orchestrate the other modules.
- `images` is standalone; called from `editor` and `core`.
- No circular dependencies allowed.

---

## 4. Data Flow

```
┌─────────────┐   paste/type    ┌──────────┐   parse    ┌──────────┐
│  Clipboard / │ ──────────────→ │  Editor  │ ────────→  │  core/   │
│  Keyboard    │                 │  Module  │            │  parser  │
└─────────────┘                 └──────────┘            └────┬─────┘
                                                             │ AST
                                                             ▼
                               ┌──────────┐  transform  ┌──────────┐
                               │  themes/ │ ←────────── │  core/   │
                               │  engine  │             │ transform│
                               └────┬─────┘             └──────────┘
                                    │ themed HTML
                                    ▼
┌──────────┐   sanitize    ┌──────────────┐   display   ┌──────────┐
│  wechat/ │ ←──────────── │  core/       │ ──────────→ │ preview/ │
│ sanitizer│               │  renderer    │             │ Preview  │
└────┬─────┘               └──────────────┘             └──────────┘
     │ wechat-safe HTML
     ▼
┌──────────┐                ┌──────────┐
│ clipboard│                │  export/ │
│   copy   │                │  pdf/html│
└──────────┘                └──────────┘
```

---

## 5. Key Design Decisions

### 5.1 Unified Markdown Pipeline (remark/rehype)

All markdown processing goes through a single `unified` pipeline. Themes, WeChat sanitization, and exports are implemented as rehype plugins. This keeps the pipeline composable and testable.

### 5.2 CSS-Only Themes

Themes are pure CSS files. The engine injects them as scoped `<style>` blocks during rendering. No JavaScript in themes — this makes them safe, portable, and easy to contribute.

### 5.3 WeChat Inline-Style Conversion

WeChat's editor strips `<style>` tags and most `class` attributes. The `wechat/inline-styles.ts` module converts all CSS classes into inline `style` attributes on each element, ensuring visual fidelity when pasted.

### 5.4 Image Strategy

Images are processed client-side (resize + compress via canvas API), then base64-encoded and embedded inline. This avoids external hosting dependencies and ensures images survive WeChat's paste pipeline.

### 5.5 Clipboard API for Copy-to-WeChat

The copy-to-WeChat flow writes `text/html` MIME type to the clipboard using the Clipboard API, allowing users to paste directly into WeChat's editor with formatting preserved.

---

## 6. Implementation Phases

### Phase 1 — Foundation (MVP)
- [ ] Project scaffolding (Next.js + TypeScript + pnpm)
- [ ] `core/parser` — markdown parsing with unified
- [ ] `core/renderer` — basic HTML rendering
- [ ] `editor/Editor` — CodeMirror markdown editor
- [ ] `preview/Preview` — live HTML preview
- [ ] 5 starter themes
- [ ] Basic copy-to-clipboard

### Phase 2 — WeChat Compatibility
- [ ] `core/parser` — magic paste (rich text → markdown)
- [ ] `wechat/sanitizer` — strip unsupported elements
- [ ] `wechat/inline-styles` — CSS → inline conversion
- [ ] `wechat/clipboard` — WeChat-optimized clipboard copy
- [ ] Expand to 15 themes

### Phase 3 — Export & Images
- [ ] `export/html` — standalone HTML file download
- [ ] `export/pdf` — Puppeteer PDF generation
- [ ] `images/uploader` — drag-and-drop image upload
- [ ] `images/processor` — resize, compress, base64
- [ ] Expand to 30+ themes

### Phase 4 — Polish
- [ ] Keyboard shortcuts
- [ ] Mobile-responsive layout
- [ ] Theme customization UI
- [ ] Performance optimization (debounced rendering)
- [ ] Documentation site

---

## 7. Non-Functional Requirements

| Concern | Target |
|---------|--------|
| First render | < 1s on 4G |
| Re-render on edit | < 100ms |
| Bundle size | < 500 KB gzipped (excl. Puppeteer) |
| Test coverage | ≥ 80% line coverage |
| Accessibility | WCAG 2.1 AA for editor UI |
| Browser support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
