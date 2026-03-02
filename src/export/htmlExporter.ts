import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { ThemeDefinition } from '../theme/themeTypes';

export function toThemedHtml(markdown: string, theme: ThemeDefinition): string {
  const htmlBody = DOMPurify.sanitize(marked.parse(markdown, { async: false }));

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Lobster Export</title>
<style>
body { margin: 0; padding: 20px; background: ${theme.tokens.background}; color: ${theme.tokens.text}; font-family: ${theme.tokens.bodyFont}; }
h1, h2, h3 { color: ${theme.tokens.heading}; font-family: ${theme.tokens.headingFont}; }
blockquote { border-left: 4px solid ${theme.tokens.quoteBorder}; background: ${theme.tokens.quoteBackground}; margin: 1rem 0; padding: 0.75rem 0.85rem; }
pre { background: ${theme.tokens.codeBackground}; padding: 0.65rem; border-radius: 8px; overflow-x: auto; }
a { color: ${theme.tokens.accent}; }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;
}
