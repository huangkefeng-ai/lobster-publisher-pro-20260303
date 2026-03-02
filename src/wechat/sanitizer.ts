import DOMPurify from 'dompurify';

const WECHAT_ALLOWED_TAGS = [
  'a',
  'article',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'section',
  'span',
  'strike',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
] as const;

const WECHAT_ALLOWED_ATTR = ['alt', 'colspan', 'href', 'rowspan', 'src', 'style', 'title'] as const;

const WECHAT_ALLOWED_URI_REGEXP =
  /^(?:(?:https?|mailto|tel):|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,)/i;

export function sanitizeWechatHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...WECHAT_ALLOWED_TAGS],
    ALLOWED_ATTR: [...WECHAT_ALLOWED_ATTR],
    FORBID_TAGS: ['script', 'style'],
    ALLOWED_URI_REGEXP: WECHAT_ALLOWED_URI_REGEXP,
  });
}
