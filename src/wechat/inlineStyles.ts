import type { ThemeDefinition } from '../theme';

function parseStyleAttribute(styleText: string): Record<string, string> {
  const declarations = styleText
    .split(';')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const style: Record<string, string> = {};
  for (const declaration of declarations) {
    const [property, ...valueParts] = declaration.split(':');
    if (!property || valueParts.length === 0) {
      continue;
    }

    style[property.trim().toLowerCase()] = valueParts.join(':').trim();
  }

  return style;
}

function toStyleAttribute(styleMap: Record<string, string>): string {
  return Object.entries(styleMap)
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ');
}

function mergeInlineStyle(element: Element, nextStyle: Record<string, string>): void {
  const currentStyle = parseStyleAttribute(element.getAttribute('style') ?? '');
  const mergedStyle = { ...nextStyle, ...currentStyle };
  element.setAttribute('style', toStyleAttribute(mergedStyle));
}

export function applyWechatInlineStyles(html: string, theme: ThemeDefinition): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(`<section data-wechat-article="true">${html}</section>`, 'text/html');
  const container = document.querySelector('section[data-wechat-article="true"]');

  if (!container) {
    return html;
  }

  const baseStyle: Record<string, string> = {
    'background-color': theme.tokens.background,
    color: theme.tokens.text,
    'font-family': theme.tokens.bodyFont,
    'font-size': '16px',
    'line-height': '1.75',
    margin: '0',
    padding: '0',
  };

  const tagStyleMap: Record<string, Record<string, string>> = {
    h1: { color: theme.tokens.heading, 'font-family': theme.tokens.headingFont, 'font-size': '30px', 'line-height': '1.3', margin: '1.3em 0 0.5em' },
    h2: { color: theme.tokens.heading, 'font-family': theme.tokens.headingFont, 'font-size': '24px', 'line-height': '1.35', margin: '1.25em 0 0.5em' },
    h3: { color: theme.tokens.heading, 'font-family': theme.tokens.headingFont, 'font-size': '20px', 'line-height': '1.4', margin: '1.2em 0 0.45em' },
    p: { margin: '0.9em 0' },
    a: { color: theme.tokens.accent, 'text-decoration': 'none', 'word-break': 'break-word' },
    blockquote: {
      margin: '1em 0',
      padding: '0.75em 0.9em',
      'border-left': `4px solid ${theme.tokens.quoteBorder}`,
      'background-color': theme.tokens.quoteBackground,
    },
    pre: {
      margin: '1em 0',
      padding: '0.75em',
      'border-radius': '8px',
      'background-color': theme.tokens.codeBackground,
      overflow: 'auto',
      'font-family': 'JetBrains Mono, SFMono-Regular, Consolas, monospace',
      'font-size': '14px',
      'line-height': '1.6',
    },
    code: {
      'background-color': theme.tokens.codeBackground,
      padding: '0.15em 0.35em',
      'border-radius': '4px',
      'font-family': 'JetBrains Mono, SFMono-Regular, Consolas, monospace',
      'font-size': '0.92em',
    },
    ul: { margin: '0.85em 0', padding: '0 0 0 1.25em' },
    ol: { margin: '0.85em 0', padding: '0 0 0 1.25em' },
    li: { margin: '0.35em 0' },
    del: { 'text-decoration': 'line-through' },
    s: { 'text-decoration': 'line-through' },
    strike: { 'text-decoration': 'line-through' },
    img: { display: 'block', 'max-width': '100%', height: 'auto', margin: '1em auto' },
    hr: { border: 'none', 'border-top': `1px solid ${theme.tokens.border}`, margin: '1.2em 0' },
    table: { width: '100%', 'border-collapse': 'collapse', margin: '1em 0' },
    th: { border: `1px solid ${theme.tokens.border}`, padding: '0.45em 0.5em', 'text-align': 'left', 'background-color': theme.tokens.surface },
    td: { border: `1px solid ${theme.tokens.border}`, padding: '0.45em 0.5em' },
  };

  mergeInlineStyle(container, baseStyle);

  const tagSelector = Object.keys(tagStyleMap).join(',');
  for (const element of Array.from(container.querySelectorAll(tagSelector))) {
    const style = tagStyleMap[element.tagName.toLowerCase()];
    if (style) {
      mergeInlineStyle(element, style);
    }
  }

  return container.outerHTML;
}
