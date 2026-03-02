const BLOCK_TAGS = new Set([
  'article',
  'aside',
  'blockquote',
  'div',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'tr',
  'ul',
]);

function htmlToPlainText(html: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const chunks: string[] = [];

  const pushLineBreak = () => {
    if (chunks.length === 0) {
      return;
    }
    if (!chunks[chunks.length - 1].endsWith('\n')) {
      chunks.push('\n');
    }
  };

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = (node.textContent ?? '').replace(/\s+/g, ' ');
      if (value.length > 0) {
        chunks.push(value);
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as Element;
    const tag = element.tagName.toLowerCase();

    if (tag === 'br') {
      pushLineBreak();
      return;
    }

    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock) {
      pushLineBreak();
    }

    for (const child of Array.from(element.childNodes)) {
      walk(child);
    }

    if (isBlock) {
      pushLineBreak();
    }
  };

  for (const node of Array.from(document.body.childNodes)) {
    walk(node);
  }

  return chunks
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export async function copyWechatHtmlToClipboard(html: string): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    throw new Error('Clipboard API is not available in this environment.');
  }

  const plainText = htmlToPlainText(html);

  if (typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard.write === 'function') {
    const item = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([plainText], { type: 'text/plain' }),
    });
    await navigator.clipboard.write([item]);
    return;
  }

  if (typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(plainText);
    return;
  }

  throw new Error('Clipboard write methods are unavailable.');
}
