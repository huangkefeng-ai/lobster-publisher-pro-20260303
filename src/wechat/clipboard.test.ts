import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyWechatHtmlToClipboard } from './clipboard';

describe('copyWechatHtmlToClipboard', () => {
  const originalClipboard = navigator.clipboard;
  const originalClipboardItem = globalThis.ClipboardItem;
  const originalExecCommand = document.execCommand;

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
    Object.defineProperty(document, 'execCommand', {
      value: originalExecCommand,
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

  it('ignores leading br when plain-text output starts empty', async () => {
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

    await copyWechatHtmlToClipboard('<br><p>Hello</p>');

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('Hello');
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

  it('throws when clipboard api is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(document, 'execCommand', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    await expect(copyWechatHtmlToClipboard('<p>Hello</p>')).rejects.toThrow(
      'Clipboard write methods are unavailable.',
    );
  });

  it('throws when clipboard write methods are unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {},
      configurable: true,
    });
    Object.defineProperty(globalThis, 'ClipboardItem', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    await expect(copyWechatHtmlToClipboard('<p>Hello</p>')).rejects.toThrow(
      'Clipboard write methods are unavailable.',
    );
  });

  it('uses execCommand fallback when clipboard.write fails', async () => {
    const write = vi.fn().mockRejectedValue(new Error('not allowed'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    const clipboardItemMock = vi.fn();
    class ClipboardItemMock {
      data: unknown;

      constructor(data: unknown) {
        clipboardItemMock(data);
        this.data = data;
      }
    }

    Object.defineProperty(navigator, 'clipboard', {
      value: { write, writeText },
      configurable: true,
    });
    Object.defineProperty(globalThis, 'ClipboardItem', {
      value: ClipboardItemMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
      writable: true,
    });

    await copyWechatHtmlToClipboard('<p>Hello</p>');

    expect(write).toHaveBeenCalledTimes(1);
    expect(writeText).not.toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});
