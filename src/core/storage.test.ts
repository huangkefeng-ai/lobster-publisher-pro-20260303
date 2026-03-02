import { afterEach, describe, expect, it } from 'vitest';
import { clearEditorDraft, loadEditorDraft, saveEditorDraft } from './storage';

describe('storage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('saves and loads a draft', () => {
    saveEditorDraft('# Hello', 'sunset-paper');
    const draft = loadEditorDraft();
    expect(draft).toEqual({ markdown: '# Hello', themeId: 'sunset-paper' });
  });

  it('returns null when no draft is stored', () => {
    expect(loadEditorDraft()).toBeNull();
  });

  it('clears a stored draft', () => {
    saveEditorDraft('# Hello', 'sunset-paper');
    clearEditorDraft();
    expect(loadEditorDraft()).toBeNull();
  });

  it('returns null for corrupted JSON', () => {
    localStorage.setItem('lobster-publisher-draft', '{bad json');
    expect(loadEditorDraft()).toBeNull();
  });

  it('returns null for valid JSON with missing fields', () => {
    localStorage.setItem('lobster-publisher-draft', '{"markdown": "ok"}');
    expect(loadEditorDraft()).toBeNull();
  });
});
