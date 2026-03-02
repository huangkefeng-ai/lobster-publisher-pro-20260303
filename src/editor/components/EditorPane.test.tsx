import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorPane } from './EditorPane';
import { markdownFromClipboard } from '../../core';
import { processImageFile } from '../../images';

vi.mock('../../images', () => ({
  processImageFile: vi.fn(),
}));

vi.mock('../../core', async () => {
  const actual = await vi.importActual<typeof import('../../core')>('../../core');
  return {
    ...actual,
    markdownFromClipboard: vi.fn(),
  };
});

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface RenderResult {
  container: HTMLDivElement;
  root: Root;
}

interface ClipboardDataLike {
  files: File[];
  getData: (type: string) => string;
}

function renderEditor(markdown: string, onMarkdownChange = vi.fn()): RenderResult & { onMarkdownChange: ReturnType<typeof vi.fn> } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<EditorPane markdown={markdown} onMarkdownChange={onMarkdownChange} />);
  });

  return { container, root, onMarkdownChange };
}

function cleanupRender({ container, root }: RenderResult) {
  act(() => {
    root.unmount();
  });
  container.remove();
}

function dispatchPaste(textarea: HTMLTextAreaElement, clipboardData: ClipboardDataLike) {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', { value: clipboardData });
  textarea.dispatchEvent(event);
}

describe('EditorPane', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('inserts snippet from toolbar at current cursor position', () => {
    const rendered = renderEditor('Hello world');
    const textarea = rendered.container.querySelector('textarea');
    expect(textarea).toBeTruthy();
    textarea?.setSelectionRange(5, 5);

    const h2Button = Array.from(rendered.container.querySelectorAll('button')).find((button) => button.textContent === '二级标题');
    expect(h2Button).toBeTruthy();

    act(() => {
      h2Button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(rendered.onMarkdownChange).toHaveBeenCalledWith('Hello\n## 新段落\n world');
    cleanupRender(rendered);
  });

  it('converts rich HTML paste into markdown insertion', () => {
    vi.mocked(markdownFromClipboard).mockReturnValue('**converted**');
    const rendered = renderEditor('abcd');
    const textarea = rendered.container.querySelector('textarea') as HTMLTextAreaElement;
    textarea.setSelectionRange(1, 2);

    act(() => {
      dispatchPaste(textarea, {
        files: [],
        getData: (type) => (type === 'text/html' ? '<p>value</p>' : 'value'),
      });
    });

    expect(markdownFromClipboard).toHaveBeenCalledWith('<p>value</p>', 'value');
    expect(rendered.onMarkdownChange).toHaveBeenCalledWith('a**converted**cd');
    cleanupRender(rendered);
  });

  it('keeps latest paste status visible for full timeout after consecutive pastes', () => {
    vi.useFakeTimers();
    vi.mocked(markdownFromClipboard).mockReturnValue('**converted**');

    const rendered = renderEditor('abcd');
    const textarea = rendered.container.querySelector('textarea') as HTMLTextAreaElement;
    textarea.setSelectionRange(1, 2);

    act(() => {
      dispatchPaste(textarea, {
        files: [],
        getData: (type) => (type === 'text/html' ? '<p>value</p>' : 'value'),
      });
    });
    expect(rendered.container.textContent).toContain('魔法粘贴成功，已转换为 Markdown');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      dispatchPaste(textarea, {
        files: [],
        getData: (type) => (type === 'text/html' ? '<p>value</p>' : 'value'),
      });
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(rendered.container.textContent).toContain('魔法粘贴成功，已转换为 Markdown');

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(rendered.container.textContent).not.toContain('魔法粘贴成功，已转换为 Markdown');

    cleanupRender(rendered);
    vi.useRealTimers();
  });

  it('handles keyboard shortcuts and applies wrapped markdown', () => {
    const rendered = renderEditor('hello');
    const textarea = rendered.container.querySelector('textarea') as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 5);

    act(() => {
      textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true, cancelable: true }));
    });

    expect(rendered.onMarkdownChange).toHaveBeenCalledWith('**hello**');
    cleanupRender(rendered);
  });

  it('processes pasted image and inserts markdown image snippet using latest editor value', async () => {
    let resolveUpload: ((value: string) => void) | null = null;
    vi.mocked(processImageFile).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve;
        }),
    );

    const rendered = renderEditor('Start');
    const textarea = rendered.container.querySelector('textarea') as HTMLTextAreaElement;
    const image = new File(['data'], 'paste]image.png', { type: 'image/png' });

    await act(async () => {
      dispatchPaste(textarea, {
        files: [image],
        getData: () => '',
      });
      await Promise.resolve();
    });

    expect(rendered.container.textContent).toContain('处理图片中...');
    expect(textarea.disabled).toBe(true);

    act(() => {
      rendered.root.render(<EditorPane markdown="Start plus" onMarkdownChange={() => undefined} />);
    });

    await act(async () => {
      resolveUpload?.('data:image/png;base64,abc');
      await Promise.resolve();
    });

    expect(rendered.onMarkdownChange).toHaveBeenCalledWith(
      'Start plus\n![paste\\]image.png](data:image/png;base64,abc)\n',
    );
    expect(textarea.disabled).toBe(false);
    cleanupRender(rendered);
  });

  it('handles dropped image files and clears input value after file picker selection', async () => {
    vi.mocked(processImageFile).mockResolvedValue('data:image/png;base64,file');
    const rendered = renderEditor('Text');
    const textarea = rendered.container.querySelector('textarea') as HTMLTextAreaElement;
    const fileInput = rendered.container.querySelector('input[type="file"]') as HTMLInputElement;
    const image = new File(['data'], 'drop.png', { type: 'image/png' });

    await act(async () => {
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
      Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [image] } });
      textarea.dispatchEvent(dropEvent);
      await Promise.resolve();
    });

    expect(processImageFile).toHaveBeenCalledWith(image);
    expect(rendered.onMarkdownChange).toHaveBeenCalledWith('\n![drop.png](data:image/png;base64,file)\nText');

    Object.defineProperty(fileInput, 'files', { value: [image], configurable: true });
    Object.defineProperty(fileInput, 'value', { value: 'C:\\fakepath\\drop.png', writable: true, configurable: true });

    await act(async () => {
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      await Promise.resolve();
    });

    expect(fileInput.value).toBe('');
    cleanupRender(rendered);
  });

  it('shows an error message when image processing fails', async () => {
    vi.mocked(processImageFile).mockRejectedValue(new Error('bad-image'));
    const rendered = renderEditor('Text');
    const textarea = rendered.container.querySelector('textarea') as HTMLTextAreaElement;
    const image = new File(['data'], 'broken.png', { type: 'image/png' });

    await act(async () => {
      dispatchPaste(textarea, {
        files: [image],
        getData: () => '',
      });
      await Promise.resolve();
    });

    expect(rendered.onMarkdownChange).not.toHaveBeenCalled();
    expect(rendered.container.textContent).toContain('图片处理失败，请尝试其他图片。');
    expect(textarea.disabled).toBe(false);
    cleanupRender(rendered);
  });
});
