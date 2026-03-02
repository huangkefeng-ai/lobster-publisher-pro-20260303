import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.use({ gfm: true, breaks: true });

export function renderMarkdownToHtml(markdown: string): string {
  return DOMPurify.sanitize(marked.parse(markdown, { async: false }));
}
