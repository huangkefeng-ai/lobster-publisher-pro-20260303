import { describe, expect, it } from 'vitest';
import { createInitialEditorState, editorReducer } from './editorState';

describe('editorState', () => {
  it('creates initial state with provided markdown', () => {
    const state = createInitialEditorState('# Hello');
    expect(state.markdown).toBe('# Hello');
  });

  it('updates markdown with set_markdown action', () => {
    const state = createInitialEditorState('# Start');
    const nextState = editorReducer(state, {
      type: 'set_markdown',
      markdown: '# Updated',
    });

    expect(nextState.markdown).toBe('# Updated');
  });

  it('inserts a snippet at an explicit position', () => {
    const state = createInitialEditorState('Hello world');
    const nextState = editorReducer(state, {
      type: 'insert_snippet',
      snippet: ' brave',
      position: 5,
    });

    expect(nextState.markdown).toBe('Hello brave world');
  });

  it('clamps negative insert position to the start', () => {
    const state = createInitialEditorState('world');
    const nextState = editorReducer(state, {
      type: 'insert_snippet',
      snippet: 'hello ',
      position: -1,
    });

    expect(nextState.markdown).toBe('hello world');
  });
});
