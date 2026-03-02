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
| Language | TypeScript 5.9 (strict) | Type safety across all modules |
| Bundler | Vite 7 | Fast HMR, ESM-native, minimal config |
| UI | React 19 + vanilla CSS | Lightweight, CSS custom properties for theming |
| Editor | `<textarea>` (phase-1) | Simple baseline; CodeMirror planned for phase-4 |
| Markdown → HTML | marked + DOMPurify | Fast parsing, XSS-safe output |
| State | `useReducer` | Zero-dep, co-located with editor module |
| Testing | Vitest + jsdom | Unit tests with DOM-capable environment |
| Package manager | npm | Standard, zero-config |
| Linting | ESLint 9 (flat config) | Consistent code style |
| CI | GitHub Actions (planned) | Lint → Test → Build on every PR |

---

## 3. Module Boundaries

The codebase is organized into **six isolated modules**. Each module owns its types, logic, and tests. Cross-module imports go through explicit barrel exports (`index.ts`).

```
src/
├── core/                  # Module 1 — Markdown processing pipeline
│   ├── constants.ts       #   App-wide defaults (DEFAULT_MARKDOWN, DEFAULT_THEME_ID)
│   ├── parser.ts          #   Rich text / HTML → Markdown (magic paste)
│   ├── renderer.ts        #   Markdown → sanitized HTML (marked + DOMPurify)
│   └── index.ts
│
├── theme/                 # Module 2 — Theme engine
│   ├── themeTypes.ts      #   ThemeTokens & ThemeDefinition interfaces
│   ├── themeRegistry.ts   #   33 built-in token-based themes + lookup
│   ├── themeCss.ts        #   Tokens → CSS custom properties
│   ├── ThemePicker.tsx    #   Theme gallery selection component
│   └── index.ts
│
├── wechat/                # Module 3 — WeChat compatibility layer
│   ├── sanitizer.ts       #   Strip unsupported tags / attrs (DOMPurify allow-list)
│   ├── inlineStyles.ts    #   Apply theme tokens as inline styles per element
│   ├── clipboard.ts       #   Copy text/html to clipboard via Clipboard API
│   └── index.ts
│
├── export/                # Module 4 — Export engine
│   ├── htmlExporter.ts    #   Themed HTML doc export + WeChat HTML + file download
│   └── index.ts
│
├── editor/                # Module 5 — Editor UI
│   ├── components/
│   │   └── EditorPane.tsx #   Textarea editor with snippet toolbar
│   ├── state/
│   │   └── editorState.ts #   useReducer-based editor state
│   └── index.ts
│
├── preview/               # Module 6 — Live preview
│   ├── components/
│   │   └── ArticlePreview.tsx  # Rendered HTML preview pane
│   └── index.ts
│
├── App.tsx                # Root component — layout + orchestration
├── App.css                # Global layout and theme variable styles
├── main.tsx               # Vite entry point
└── index.css              # Font imports
```

### Module Dependency Graph

```
editor ──→ core
  │          │
  ▼          ▼
preview    export ──→ wechat
             │
             ▼
           theme
```

**Rules:**
- `core` owns the shared markdown→HTML renderer (`renderer.ts`) used by `preview` and `export`.
- `wechat` depends on `core` output (rendered HTML) but NOT on `core` internals.
- `export` depends on `core` + `wechat` + `theme` (generates final exportable artifacts).
- `editor` and `preview` are UI shells; they orchestrate the other modules.
- `theme` is data-only (types + token registry + CSS variable mapping).
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

### 5.1 Centralized Markdown Renderer (marked + DOMPurify)

All markdown→HTML conversion goes through `core/renderer.ts`, which calls `marked.parse()` and sanitizes via `DOMPurify.sanitize()`. Both `preview/` and `export/` consume this single function, eliminating duplication and ensuring consistent GFM + line-break handling.

### 5.2 Token-Based Themes

Themes are TypeScript objects with a `ThemeTokens` interface (colors, fonts). The theme engine maps tokens to CSS custom properties at runtime via `toThemeCssVariables()`. No separate CSS files — tokens are the single source of truth.

### 5.3 WeChat Inline-Style Conversion

WeChat's editor strips `<style>` tags and most `class` attributes. The `wechat/inline-styles.ts` module converts all CSS classes into inline `style` attributes on each element, ensuring visual fidelity when pasted.

### 5.4 Image Strategy

Images are processed client-side (resize + compress via canvas API), then base64-encoded and embedded inline. This avoids external hosting dependencies and ensures images survive WeChat's paste pipeline.

### 5.5 Clipboard API for Copy-to-WeChat

The copy-to-WeChat flow writes `text/html` MIME type to the clipboard using the Clipboard API, allowing users to paste directly into WeChat's editor with formatting preserved.

---

## 6. Implementation Phases

### Phase 1 — Foundation (MVP)
- [x] Project scaffolding (Vite + TypeScript + npm)
- [x] `core/parser` — rich text → markdown (magic paste via DOMParser)
- [x] `core/renderer` — markdown → sanitized HTML (marked + DOMPurify)
- [x] `editor/EditorPane` — textarea markdown editor with snippet toolbar
- [x] `preview/ArticlePreview` — live themed HTML preview
- [x] 33 token-based themes with gallery picker
- [x] Barrel `index.ts` exports for all modules

### Phase 2 — WeChat Compatibility
- [x] `wechat/sanitizer` — strip unsupported elements (DOMPurify allow-list)
- [x] `wechat/inlineStyles` — theme tokens → inline styles per element
- [x] `wechat/clipboard` — Clipboard API `text/html` copy
- [x] Copy-to-WeChat button in UI
- [x] 33 themes (exceeds 15 target)

### Phase 3 — Export & Images
- [x] `export/htmlExporter` — standalone themed HTML file download
- [ ] `export/pdf` — PDF generation (planned)
- [ ] `images/uploader` — drag-and-drop image upload
- [ ] `images/processor` — resize, compress, base64
- [x] 33 themes (exceeds 30+ target)

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
