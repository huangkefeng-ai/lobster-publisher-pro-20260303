import { describe, expect, it } from 'vitest';
import { handleEditorShortcut } from './shortcuts';

describe('handleEditorShortcut', () => {
  it('wraps selection in bold with Ctrl+B', () => {
    const result = handleEditorShortcut(
      { key: 'b', metaKey: false, ctrlKey: true, shiftKey: false },
      'hello world',
      6,
      11,
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('hello **world**');
    expect(result!.selectionStart).toBe(8);
    expect(result!.selectionEnd).toBe(13);
  });

  it('wraps selection in italic with Ctrl+I', () => {
    const result = handleEditorShortcut(
      { key: 'i', metaKey: false, ctrlKey: true, shiftKey: false },
      'hello world',
      6,
      11,
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('hello *world*');
  });

  it('inserts a link with Ctrl+K', () => {
    const result = handleEditorShortcut(
      { key: 'k', metaKey: false, ctrlKey: true, shiftKey: false },
      'click here please',
      6,
      10,
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('click [here](url) please');
    // cursor should select "url"
    expect(result!.selectionStart).toBe(13);
    expect(result!.selectionEnd).toBe(16);
  });

  it('wraps selection in inline code with Ctrl+Shift+C', () => {
    const result = handleEditorShortcut(
      { key: 'c', metaKey: false, ctrlKey: true, shiftKey: true },
      'use useState here',
      4,
      12,
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('use `useState` here');
  });

  it('indents with Tab', () => {
    const result = handleEditorShortcut(
      { key: 'Tab', metaKey: false, ctrlKey: false, shiftKey: false },
      'line one\nline two',
      9,
      17,
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('line one\n  line two');
  });

  it('outdents with Shift+Tab', () => {
    const result = handleEditorShortcut(
      { key: 'Tab', metaKey: false, ctrlKey: false, shiftKey: true },
      'line one\n  line two',
      11,
      19,
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('line one\nline two');
  });

  it('returns null for unhandled keys', () => {
    const result = handleEditorShortcut(
      { key: 'z', metaKey: false, ctrlKey: false, shiftKey: false },
      'hello',
      0,
      5,
    );
    expect(result).toBeNull();
  });

  it('handles Cmd+B on macOS', () => {
    const result = handleEditorShortcut(
      { key: 'b', metaKey: true, ctrlKey: false, shiftKey: false },
      'text',
      0,
      4,
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('**text**');
  });

  it('handles uppercase key values from keyboard events', () => {
    const result = handleEditorShortcut(
      { key: 'C', metaKey: false, ctrlKey: true, shiftKey: true },
      'use state',
      4,
      9,
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('use `state`');
  });
});
