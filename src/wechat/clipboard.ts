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
  'td',
  'th',
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

  const walk = (node: Node, inPre = false) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.textContent ?? '';
      const value = inPre ? raw : raw.replace(/\s+/g, ' ');
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

    const nextInPre = inPre || tag === 'pre';
    for (const child of Array.from(element.childNodes)) {
      walk(child, nextInPre);
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
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function copyWechatHtmlToClipboard(html: string): Promise<void> {
  const plainText = htmlToPlainText(html);
  const hasNavigator = typeof navigator !== 'undefined';
  const clipboard = hasNavigator ? navigator.clipboard : undefined;

  if (clipboard && typeof ClipboardItem !== 'undefined' && typeof clipboard.write === 'function') {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      });
      await clipboard.write([item]);
      return;
    } catch {
      // Fallback
    }
  }

  if (
    typeof document !== 'undefined' &&
    typeof window !== 'undefined' &&
    document.body &&
    typeof document.execCommand === 'function'
  ) {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    document.body.appendChild(container);

    try {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(container);
        selection.removeAllRanges();
        selection.addRange(range);

        const success = document.execCommand('copy');
        selection.removeAllRanges();

        if (success) {
          return;
        }
      }
    } catch {
      // Ignore and fallback
    } finally {
      document.body.removeChild(container);
    }
  }

  if (clipboard && typeof clipboard.writeText === 'function') {
    await clipboard.writeText(plainText);
    return;
  }

  if (!hasNavigator) {
    throw new Error('Clipboard API is not available in this environment.');
  }

  throw new Error('Clipboard write methods are unavailable.');
}
