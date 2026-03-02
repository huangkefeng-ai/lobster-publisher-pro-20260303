import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./wechat', async () => {
  const actual = await vi.importActual<typeof import('./wechat')>('./wechat');
  return {
    ...actual,
    copyWechatHtmlToClipboard: vi.fn().mockResolvedValue(undefined),
  };
});

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface RenderResult {
  container: HTMLDivElement;
  root: Root;
}

function renderApp(): RenderResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<App />);
  });

  return { container, root };
}

function cleanupRender({ container, root }: RenderResult) {
  act(() => {
    root.unmount();
  });
  container.remove();
}

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('clears pending status timeout on unmount', async () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const rendered = renderApp();

    const copyButton = rendered.container.querySelector(
      'button[aria-label="Copy WeChat HTML to clipboard"]',
    ) as HTMLButtonElement | null;
    expect(copyButton).not.toBeNull();

    await act(async () => {
      copyButton?.click();
      await Promise.resolve();
    });

    let statusTimerCallIndex = -1;
    for (let index = setTimeoutSpy.mock.calls.length - 1; index >= 0; index -= 1) {
      if (setTimeoutSpy.mock.calls[index]?.[1] === 4000) {
        statusTimerCallIndex = index;
        break;
      }
    }
    expect(statusTimerCallIndex).toBeGreaterThanOrEqual(0);
    const statusTimerId = setTimeoutSpy.mock.results[statusTimerCallIndex]?.value;

    cleanupRender(rendered);

    expect(clearTimeoutSpy).toHaveBeenCalledWith(statusTimerId);
  });

  it('keeps a persistent status live region and clears message after timeout', async () => {
    const rendered = renderApp();

    const status = rendered.container.querySelector('[role="status"]');
    expect(status).toBeTruthy();
    expect(status?.textContent).toBe('');

    const copyButton = rendered.container.querySelector('button[aria-label="Copy WeChat HTML to clipboard"]');
    expect(copyButton).toBeTruthy();

    await act(async () => {
      copyButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
    });

    expect(status?.textContent).toContain('已复制公众号兼容的 HTML 到剪贴板。');

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(status?.textContent).toBe('');

    cleanupRender(rendered);
  });
});
