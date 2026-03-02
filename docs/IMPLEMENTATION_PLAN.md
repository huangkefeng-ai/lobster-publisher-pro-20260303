# Lobster Publisher Pro — Implementation Plan

## Current State (Phase 1 Complete)

| Module | Files | Status |
|--------|-------|--------|
| **core/parser** | `parser.ts` | HTML→Markdown magic-paste conversion |
| **core/renderer** | `renderer.ts` | Markdown→HTML via `marked` + DOMPurify |
| **core/constants** | `constants.ts` | Default markdown content, default theme ID |
| **theme** | `themeTypes.ts`, `themeRegistry.ts`, `themeCss.ts`, `ThemePicker.tsx` | 33 themes, token system, CSS-variable bridge |
| **wechat** | `sanitizer.ts`, `inlineStyles.ts`, `clipboard.ts` | WeChat-safe HTML pipeline |
| **export** | `htmlExporter.ts` | Themed HTML export, WeChat HTML, file download |
| **editor** | `editorState.ts`, `EditorPane.tsx` | Reducer-based state, toolbar snippets, paste handler |
| **preview** | `ArticlePreview.tsx` | Live themed preview |

## Phase 2 — Core Logic Modules

### 2.1 Document Statistics (`src/core/statistics.ts`)

Compute article-level metrics for the status bar and export metadata.

- **`computeDocumentStats(markdown)`** → `{ charCount, wordCount, lineCount, readingTimeMinutes }`
- Reading time: 275 words/minute (Chinese-aware: 1 CJK char ≈ 1 word)
- Pure function, no side effects

### 2.2 Local Storage Persistence (`src/core/storage.ts`)

Save/restore editor content and selected theme across sessions.

- **`saveEditorDraft(markdown, themeId)`** — debounced write to `localStorage`
- **`loadEditorDraft()`** → `{ markdown, themeId } | null`
- **`clearEditorDraft()`** — remove stored draft
- Storage key: `lobster-publisher-draft`

### 2.3 Keyboard Shortcuts (`src/editor/shortcuts.ts`)

Productivity shortcuts for the textarea editor.

- **`handleEditorShortcut(event, textarea)`** → `{ handled, value, selectionStart, selectionEnd } | null`
- `Ctrl/Cmd+B` → bold selection `**…**`
- `Ctrl/Cmd+I` → italic selection `*…*`
- `Ctrl/Cmd+K` → link `[…](url)`
- `Ctrl/Cmd+Shift+C` → inline code `` `…` ``
- `Tab` → indent 2 spaces, `Shift+Tab` → outdent

### 2.4 Theme Search & Filter (`src/theme/themeFilter.ts`)

Filter the 33-theme gallery by name or family for quick selection.

- **`filterThemes(themes, query)`** → filtered `ThemeDefinition[]`
- Case-insensitive match against `name` and `family`
- Empty query returns all themes

### 2.5 PDF Export (`src/export/pdfExporter.ts`)

Browser-native PDF export using a hidden iframe + `window.print()`.

- **`printThemedArticle(html)`** — opens print dialog for a themed HTML document
- No server-side dependencies; works fully client-side

## Architecture Principles

1. **Pure logic first** — every module is a pure function before it touches React
2. **Test alongside** — every `.ts` logic file has a sibling `.test.ts`
3. **Barrel re-exports** — each module folder has `index.ts` for clean imports
4. **Small commits** — one logical unit per commit, pushed to `main`

## Dependency Graph

```
App.tsx
├── core/       (parser, renderer, constants, statistics, storage)
├── editor/     (editorState, EditorPane, shortcuts)
├── theme/      (registry, types, css, picker, filter)
├── wechat/     (sanitizer, inlineStyles, clipboard)
├── export/     (htmlExporter, pdfExporter)
└── preview/    (ArticlePreview)
```

## Commit Plan

| # | Scope | Description |
|---|-------|-------------|
| 1 | docs | Add implementation plan |
| 2 | core | Add document statistics module |
| 3 | core | Add local storage persistence module |
| 4 | editor | Add keyboard shortcuts module |
| 5 | theme | Add theme search/filter module |
| 6 | export | Add PDF export module |
| 7 | app | Wire new modules into App and barrel exports |
