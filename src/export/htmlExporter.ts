import { wechatPipeline, htmlExportPipeline } from '../pipeline';
import { PublishErrorCode } from '../core/errors';
import type { ThemeDefinition } from '../theme';

function sanitizeCssValue(value: string): string {
  return value.replace(/[<>"'\\]/g, '');
}

export function toThemedHtml(markdown: string, theme: ThemeDefinition): string {
  const result = htmlExportPipeline(markdown, theme);
  if (!result.ok) {
    if (result.error.code === PublishErrorCode.EMPTY_INPUT) return '';
    throw result.error;
  }
  const htmlBody = result.value.html;
  const t = (v: string) => sanitizeCssValue(v);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Lobster Publisher 导出</title>
<style>
body { margin: 0; padding: 20px; background: ${t(theme.tokens.background)}; color: ${t(theme.tokens.text)}; font-family: ${t(theme.tokens.bodyFont)}; }
h1, h2, h3 { color: ${t(theme.tokens.heading)}; font-family: ${t(theme.tokens.headingFont)}; }
blockquote { border-left: 4px solid ${t(theme.tokens.quoteBorder)}; background: ${t(theme.tokens.quoteBackground)}; margin: 1rem 0; padding: 0.75rem 0.85rem; }
pre { background: ${t(theme.tokens.codeBackground)}; padding: 0.65rem; border-radius: 8px; overflow-x: auto; }
a { color: ${t(theme.tokens.accent)}; }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;
}

export function toWechatHtml(markdown: string, theme: ThemeDefinition): string {
  const result = wechatPipeline(markdown, theme);
  if (!result.ok) {
    if (result.error.code === PublishErrorCode.EMPTY_INPUT) return '';
    throw result.error;
  }
  return result.value.html;
}

export function downloadHtmlFile(filename: string, html: string): void {
  const safeFilename =
    filename
      .replace(/[/\\?%*:|"<>]/g, '_')
      .split('')
      .map((char) => (char.charCodeAt(0) <= 0x1f ? '_' : char))
      .join('') || 'export.html';
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeFilename;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 0);
}
