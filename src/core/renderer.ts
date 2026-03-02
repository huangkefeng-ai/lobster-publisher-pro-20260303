import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { RendererObject, Tokens } from 'marked';
import { highlightCode } from './highlight';

const codeRenderer: RendererObject = {
  code({ text, lang }: Tokens.Code): string {
    const highlighted = highlightCode(text, lang ?? '');
    const langAttr = lang ? ` data-lang="${lang}"` : '';
    return `<pre${langAttr}><code>${highlighted}</code></pre>\n`;
  },
};

marked.use({ gfm: true, breaks: true, renderer: codeRenderer });

export function renderMarkdownToHtml(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['span'],
    ADD_ATTR: ['style', 'data-lang'],
  });
}
