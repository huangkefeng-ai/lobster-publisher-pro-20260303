import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { printThemedArticle } from './pdfExporter';

describe('printThemedArticle', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // jsdom logs "Not implemented: Window's print() method".
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  it('creates a hidden iframe and writes html content', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');

    printThemedArticle('<html><body><h1>Test</h1></body></html>');

    expect(appendSpy).toHaveBeenCalledOnce();
    const iframe = appendSpy.mock.calls[0][0] as HTMLIFrameElement;
    expect(iframe.tagName).toBe('IFRAME');
    expect(iframe.style.position).toBe('fixed');
    expect(iframe.style.left).toBe('-9999px');

    // Clean up
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    appendSpy.mockRestore();
  });

  it('writes HTML content into the iframe document', () => {
    const testHtml = '<html><body><p>Article content</p></body></html>';
    const appendSpy = vi.spyOn(document.body, 'appendChild');

    printThemedArticle(testHtml);

    const iframe = appendSpy.mock.calls[0][0] as HTMLIFrameElement;
    const iframeDoc = iframe.contentDocument;
    expect(iframeDoc?.body.innerHTML).toContain('Article content');

    // Clean up
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    appendSpy.mockRestore();
  });

  it('prints only once when onload and fallback are both triggered', () => {
    vi.useFakeTimers();
    const appendSpy = vi.spyOn(document.body, 'appendChild');

    printThemedArticle('<html><body><p>Article content</p></body></html>');

    const iframe = appendSpy.mock.calls[0][0] as HTMLIFrameElement;
    const contentWindow = iframe.contentWindow;
    expect(contentWindow).toBeTruthy();
    const printSpy = vi.spyOn(contentWindow as Window, 'print').mockImplementation(() => {});

    iframe.onload?.(new Event('load'));
    vi.advanceTimersByTime(300);

    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    appendSpy.mockRestore();
  });
});
