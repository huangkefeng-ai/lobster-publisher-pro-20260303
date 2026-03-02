import { useMemo, useReducer, useState } from 'react';
import './App.css';
import { DEFAULT_MARKDOWN, DEFAULT_THEME_ID } from './core/constants';
import { EditorPane } from './editor/components/EditorPane';
import { createInitialEditorState, editorReducer } from './editor/state/editorState';
import { ArticlePreview } from './preview/components/ArticlePreview';
import { ThemePicker } from './theme/ThemePicker';
import { getThemeById, THEME_REGISTRY } from './theme/themeRegistry';

function App() {
  const [editorState, dispatch] = useReducer(editorReducer, createInitialEditorState(DEFAULT_MARKDOWN));
  const [selectedThemeId, setSelectedThemeId] = useState(DEFAULT_THEME_ID);

  const selectedTheme = useMemo(
    () => getThemeById(selectedThemeId) ?? THEME_REGISTRY[0],
    [selectedThemeId],
  );

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>Lobster Publisher Pro</h1>
        <p>Phase 1: foundation, markdown editor, and scalable theme system.</p>
      </header>

      <section className="workspace-grid">
        <EditorPane
          markdown={editorState.markdown}
          onMarkdownChange={(markdown) => dispatch({ type: 'set_markdown', markdown })}
        />
        <ArticlePreview markdown={editorState.markdown} theme={selectedTheme} />
      </section>

      <ThemePicker
        selectedThemeId={selectedTheme.id}
        themes={THEME_REGISTRY}
        onSelectTheme={setSelectedThemeId}
      />
    </main>
  );
}

export default App;
