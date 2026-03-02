const STORAGE_KEY = 'lobster-publisher-draft-v3';

export interface EditorDraft {
  markdown: string;
  themeId: string;
}

export function saveEditorDraft(markdown: string, themeId: string): void {
  try {
    const payload: EditorDraft = { markdown, themeId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be full or unavailable — fail silently
  }
}

export function loadEditorDraft(): EditorDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'markdown' in parsed &&
      'themeId' in parsed &&
      typeof (parsed as EditorDraft).markdown === 'string' &&
      typeof (parsed as EditorDraft).themeId === 'string'
    ) {
      return parsed as EditorDraft;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearEditorDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
}
