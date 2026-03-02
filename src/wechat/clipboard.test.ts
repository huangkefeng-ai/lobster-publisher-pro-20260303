import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyWechatHtmlToClipboard } from './clipboard';

describe('copyWechatHtmlToClipboard', () => {
  const originalClipboard = navigator.clipboard;
  const originalClipboardItem = globalThis.ClipboardItem;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'ClipboardItem', {
      value: originalClipboardItem,
      configurable: true,
      writable: true,
    });
  });

  it('keeps line breaks between block elements for plain-text clipboard fallback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    Object.defineProperty(globalThis, 'ClipboardItem', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    await copyWechatHtmlToClipboard('<p>Hello</p><p>World</p>');

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('Hello\nWorld');
  });

  it('uses clipboard.write with html and plain text when ClipboardItem is available', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const clipboardItemMock = vi.fn();
    class ClipboardItemMock {
      data: unknown;

      constructor(data: unknown) {
        clipboardItemMock(data);
        this.data = data;
      }
    }

    Object.defineProperty(navigator, 'clipboard', {
      value: { write },
      configurable: true,
    });
    Object.defineProperty(globalThis, 'ClipboardItem', {
      value: ClipboardItemMock,
      configurable: true,
      writable: true,
    });

    await copyWechatHtmlToClipboard('<p>Hello</p>');

    expect(clipboardItemMock).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(1);
  });
});
