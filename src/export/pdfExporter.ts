export function printThemedArticle(html: string): void {
  const PRINT_CLEANUP_TIMEOUT_MS = 15_000;
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
  let cleanupTimer = 0;

  const removeIframe = () => {
    window.clearTimeout(fallbackTimer);
    window.clearTimeout(cleanupTimer);
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  };

  const printOnce = () => {
    if (hasPrinted) {
      return;
    }
    hasPrinted = true;
    window.clearTimeout(fallbackTimer);
    const win = iframe.contentWindow;
    if (!win) {
      removeIframe();
      return;
    }
    const handleAfterPrint = () => {
      removeIframe();
    };

    win.addEventListener('afterprint', handleAfterPrint, { once: true });
    cleanupTimer = window.setTimeout(handleAfterPrint, PRINT_CLEANUP_TIMEOUT_MS);

    try {
      win.print();
    } catch {
      handleAfterPrint();
    }
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
