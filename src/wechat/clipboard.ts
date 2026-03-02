function htmlToPlainText(html: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  return document.body.textContent ?? '';
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
