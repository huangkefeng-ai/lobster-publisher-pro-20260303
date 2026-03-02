import { useMemo, useReducer, useState } from 'react';
import './App.css';
import { DEFAULT_MARKDOWN, DEFAULT_THEME_ID } from './core/constants';
import { EditorPane } from './editor/components/EditorPane';
import { createInitialEditorState, editorReducer } from './editor/state/editorState';
import { downloadHtmlFile, toThemedHtml, toWechatHtml } from './export/htmlExporter';
import { ArticlePreview } from './preview/components/ArticlePreview';
import { ThemePicker } from './theme/ThemePicker';
import { getThemeById, THEME_REGISTRY } from './theme/themeRegistry';
import { copyWechatHtmlToClipboard } from './wechat';

function App() {
  const [editorState, dispatch] = useReducer(editorReducer, createInitialEditorState(DEFAULT_MARKDOWN));
  const [selectedThemeId, setSelectedThemeId] = useState(DEFAULT_THEME_ID);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const selectedTheme = useMemo(
    () => getThemeById(selectedThemeId) ?? THEME_REGISTRY[0],
    [selectedThemeId],
  );
  const wechatHtml = useMemo(
    () => toWechatHtml(editorState.markdown, selectedTheme),
    [editorState.markdown, selectedTheme],
  );

  async function handleCopyWechatHtml() {
    try {
      await copyWechatHtmlToClipboard(wechatHtml);
      setActionStatus('Copied WeChat-ready HTML to clipboard.');
    } catch {
      setActionStatus('Copy failed. Check clipboard permissions and try again.');
    }
  }

  function handleDownloadHtml() {
    const htmlDocument = toThemedHtml(editorState.markdown, selectedTheme);
    downloadHtmlFile(`lobster-${selectedTheme.id}.html`, htmlDocument);
    setActionStatus('Downloaded themed HTML file.');
  }

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

      <section className="panel actions-panel">
        <header className="panel-header">
          <h2>Publish Actions</h2>
          <p>WeChat compatibility + export</p>
        </header>
        <div className="action-row">
          <button type="button" onClick={handleCopyWechatHtml}>
            Copy WeChat HTML
          </button>
          <button type="button" onClick={handleDownloadHtml}>
            Export HTML File
          </button>
        </div>
        {actionStatus ? <p className="action-status">{actionStatus}</p> : null}
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
