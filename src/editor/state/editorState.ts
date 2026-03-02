export interface EditorState {
  markdown: string;
}

export type EditorAction =
  | { type: 'set_markdown'; markdown: string }
  | { type: 'insert_snippet'; snippet: string; position?: number };

export function createInitialEditorState(markdown: string): EditorState {
  return { markdown };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'set_markdown':
      return { ...state, markdown: action.markdown };
    case 'insert_snippet': {
      const index = action.position ?? state.markdown.length;
      const nextMarkdown =
        state.markdown.slice(0, index) + action.snippet + state.markdown.slice(index);
      return { ...state, markdown: nextMarkdown };
    }
    default:
      return state;
  }
}
