export function printThemedArticle(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('Failed to access iframe document for printing.');
  }

  let hasPrinted = false;
  let fallbackTimer = 0;

  const printOnce = () => {
    if (hasPrinted) {
      return;
    }
    hasPrinted = true;
    window.clearTimeout(fallbackTimer);
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  };

  iframe.onload = () => {
    printOnce();
  };

  // Fallback for browsers that never dispatch iframe onload after document.write().
  fallbackTimer = window.setTimeout(() => {
    printOnce();
  }, 250);

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();
}
