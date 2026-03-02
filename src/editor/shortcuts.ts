export interface ShortcutResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

function wrapSelection(value: string, start: number, end: number, prefix: string, suffix: string): ShortcutResult {
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);
  const wrapped = `${prefix}${selected}${suffix}`;
  return {
    value: before + wrapped + after,
    selectionStart: start + prefix.length,
    selectionEnd: start + prefix.length + selected.length,
  };
}

function indentLines(value: string, start: number, end: number): ShortcutResult {
  const beforeStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineRegion = value.slice(beforeStart, end);
  const indented = lineRegion.replace(/^/gm, '  ');
  const added = indented.length - lineRegion.length;
  return {
    value: value.slice(0, beforeStart) + indented + value.slice(end),
    selectionStart: start + 2,
    selectionEnd: end + added,
  };
}

function outdentLines(value: string, start: number, end: number): ShortcutResult {
  const beforeStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineRegion = value.slice(beforeStart, end);
  const outdented = lineRegion.replace(/^( {1,2})/gm, '');
  const removed = lineRegion.length - outdented.length;
  return {
    value: value.slice(0, beforeStart) + outdented + value.slice(end),
    selectionStart: Math.max(beforeStart, start - Math.min(2, start - beforeStart)),
    selectionEnd: end - removed,
  };
}

export function handleEditorShortcut(
  event: { key: string; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean },
  value: string,
  selectionStart: number,
  selectionEnd: number,
): ShortcutResult | null {
  const mod = event.metaKey || event.ctrlKey;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (mod && !event.shiftKey && key === 'b') {
    return wrapSelection(value, selectionStart, selectionEnd, '**', '**');
  }

  if (mod && !event.shiftKey && key === 'i') {
    return wrapSelection(value, selectionStart, selectionEnd, '*', '*');
  }

  if (mod && !event.shiftKey && key === 'k') {
    const selected = value.slice(selectionStart, selectionEnd);
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const link = `[${selected}](url)`;
    return {
      value: before + link + after,
      selectionStart: selectionStart + selected.length + 3,
      selectionEnd: selectionStart + selected.length + 6,
    };
  }

  if (mod && event.shiftKey && key === 'c') {
    return wrapSelection(value, selectionStart, selectionEnd, '`', '`');
  }

  if (key === 'Tab' && !mod) {
    if (event.shiftKey) {
      return outdentLines(value, selectionStart, selectionEnd);
    }
    return indentLines(value, selectionStart, selectionEnd);
  }

  return null;
}
