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
    strong: { color: theme.tokens.accent, 'font-weight': '700' },
    b: { color: theme.tokens.accent, 'font-weight': '700' },
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
    table: { 
      width: '100%', 
      'border-collapse': 'collapse', 
      margin: '1.5em 0', 
      'word-break': 'break-word', 
      'box-sizing': 'border-box',
      'border': `1px solid ${theme.tokens.border}`,
      'font-size': '15px'
    },
    th: { 
      border: `1px solid ${theme.tokens.border}`, 
      padding: '0.6em 0.8em', 
      'text-align': 'left', 
      'background-color': theme.tokens.quoteBackground || '#f8fafc', 
      'box-sizing': 'border-box', 
      'min-width': '60px',
      'font-weight': '600'
    },
    td: { 
      border: `1px solid ${theme.tokens.border}`, 
      padding: '0.6em 0.8em', 
      'box-sizing': 'border-box', 
      'min-width': '60px',
      'line-height': '1.5'
    },
  };

  mergeInlineStyle(container, baseStyle);

  const tagSelector = Object.keys(tagStyleMap).join(',');
  for (const element of Array.from(container.querySelectorAll(tagSelector))) {
    const style = tagStyleMap[element.tagName.toLowerCase()];
    if (style) {
      mergeInlineStyle(element, style);
    }
  }

  // Handle code block macOS-style header
  const codeBlocks = container.querySelectorAll('div.code-block');
  for (const block of Array.from(codeBlocks)) {
    mergeInlineStyle(block as Element, {
      border: `1px solid ${theme.tokens.border}`,
      'border-radius': '10px',
      overflow: 'hidden',
      margin: '1em 0',
      'background-color': theme.tokens.codeBackground,
    });
  }

  const codeHeaders = container.querySelectorAll('div.code-block-header');
  for (const header of Array.from(codeHeaders)) {
    mergeInlineStyle(header as Element, {
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'space-between',
      padding: '0.45em 0.7em',
      'border-bottom': `1px solid ${theme.tokens.border}`,
      'background-color': theme.tokens.codeBackground,
    });
  }

  const trafficDots = container.querySelectorAll('.traffic-dot');
  for (const dot of Array.from(trafficDots)) {
    const el = dot as Element;
    const cls = el.getAttribute('class') ?? '';
    let color = '#ff5f57';
    if (cls.includes('yellow')) color = '#febc2e';
    if (cls.includes('green')) color = '#28c840';
    mergeInlineStyle(el, {
      display: 'inline-block',
      width: '10px',
      height: '10px',
      'border-radius': '50%',
      'background-color': color,
      margin: '0 3px 0 0',
    });
  }

  const codeLangLabels = container.querySelectorAll('.code-block-lang');
  for (const label of Array.from(codeLangLabels)) {
    mergeInlineStyle(label as Element, {
      'font-size': '12px',
      color: theme.tokens.text,
      opacity: '0.75',
      'text-transform': 'lowercase',
    });
  }

  // Handle multi-image grid
  const imageGroups = container.querySelectorAll('div[data-image-group="true"]');
  for (const group of Array.from(imageGroups)) {
    mergeInlineStyle(group as Element, {
      display: 'flex',
      'flex-direction': 'row',
      'flex-wrap': 'nowrap',
      'justify-content': 'center',
      gap: '4px',
      margin: '1.2em 0'
    });
    
    // We expect the direct children to be the containers created in renderer.ts
    const children = group.children;
    for (const child of Array.from(children)) {
      mergeInlineStyle(child as Element, {
        flex: '1',
        'min-width': '0'
      });
      const innerImg = child.querySelector('img');
      if (innerImg) {
        mergeInlineStyle(innerImg, {
          width: '100%',
          height: 'auto',
          margin: '0',
          display: 'block'
        });
      }
    }
  }

  return container.outerHTML;
}
