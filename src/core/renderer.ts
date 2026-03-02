import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { RendererObject, Tokens } from 'marked';
import { highlightCode } from './highlight';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const codeRenderer: RendererObject = {
  code({ text, lang }: Tokens.Code): string {
    const highlighted = highlightCode(text, lang ?? '');
    const langAttr = lang ? ` data-lang="${escapeAttr(lang)}"` : '';
    return `<pre${langAttr}><code>${highlighted}</code></pre>\n`;
  },
  paragraph({ tokens }: Tokens.Paragraph): string | false {
    if (tokens && tokens.length > 1) {
      const isMultiImage = tokens.every(t => t.type === 'image' || (t.type === 'text' && !t.raw.trim()) || t.type === 'space');
      if (isMultiImage) {
        const images = tokens.filter(t => t.type === 'image') as Tokens.Image[];
        if (images.length > 1) {
          const gridHtml = images.map(img => 
             `<div style="flex: 1; min-width: 0; padding: 2px;"><img src="${escapeAttr(img.href)}" alt="${escapeAttr(img.text)}" title="${escapeAttr(img.title || '')}" style="width: 100%; height: auto; display: block;" /></div>`
          ).join('');
          return `<div data-image-group="true" style="display: flex; flex-wrap: wrap; justify-content: space-between; margin: 1em 0;">${gridHtml}</div>\n`;
        }
      }
    }
    return false; // let marked use default
  }
};

marked.use({ gfm: true, breaks: true, renderer: codeRenderer });

export function renderMarkdownToHtml(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['span', 'div', 'section'],
    ADD_ATTR: ['style', 'data-lang', 'data-image-group'],
  });
}
