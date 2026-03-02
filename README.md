# Lobster Publisher Pro

AI-first WeChat article layout tool.

## Phase-1 Status

Implemented in this repo:

- foundation app architecture (`core`, `editor`, `theme`, `preview`, `export`)
- markdown editor with snippet toolbar
- live preview rendering from markdown
- theme system with 30+ tokenized themes and instant switching
- themed HTML export utility scaffold
- unit tests for editor state + theme registry

## Local Development

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

## Module Layout

- `src/core`: app defaults and shared constants
- `src/editor`: editor UI and reducer-based state model
- `src/theme`: theme definitions, registry, and CSS variable mapping
- `src/preview`: markdown -> themed live article preview
- `src/export`: initial HTML export pipeline utilities

## Notes

This is the phase-1 baseline. Later phases can layer in:

- rich-text magic paste to markdown normalization
- WeChat-specific HTML compatibility transforms
- image upload/processing and copy-to-WeChat workflow
- PDF export pipeline and end-to-end tests
