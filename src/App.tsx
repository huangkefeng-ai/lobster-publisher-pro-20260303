import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import './App.css';
import {
  DEFAULT_MARKDOWN,
  DEFAULT_THEME_ID,
  computeDocumentStats,
  createDebouncedFunction,
  loadEditorDraft,
  saveEditorDraft,
} from './core';
import { EditorPane, createInitialEditorState, editorReducer } from './editor';
import { downloadHtmlFile, printThemedArticle, toThemedHtml, toWechatHtml } from './export';
import { ArticlePreview } from './preview';
import { ThemePicker, filterThemes, getThemeById, THEME_REGISTRY } from './theme';
import { copyWechatHtmlToClipboard } from './wechat';

function App() {
  const initialDraft = useMemo(() => loadEditorDraft(), []);
  const initialMarkdown = initialDraft?.markdown ?? DEFAULT_MARKDOWN;
  const initialThemeId =
    initialDraft?.themeId && getThemeById(initialDraft.themeId)
      ? initialDraft.themeId
      : DEFAULT_THEME_ID;

  const [editorState, dispatch] = useReducer(editorReducer, createInitialEditorState(initialMarkdown));
  const [selectedThemeId, setSelectedThemeId] = useState(initialThemeId);
  const [previewMarkdown, setPreviewMarkdown] = useState(initialMarkdown);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [themeQuery, setThemeQuery] = useState('');

  const selectedTheme = useMemo(
    () => getThemeById(selectedThemeId) ?? THEME_REGISTRY[0],
    [selectedThemeId],
  );
  const persistDraft = useMemo(
    () => createDebouncedFunction((markdown: string, themeId: string) => saveEditorDraft(markdown, themeId), 250),
    [],
  );
  const updatePreview = useMemo(
    () => createDebouncedFunction((markdown: string) => setPreviewMarkdown(markdown), 100),
    [],
  );
  const wechatHtml = useMemo(
    () => toWechatHtml(editorState.markdown, selectedTheme),
    [editorState.markdown, selectedTheme],
  );
  const stats = useMemo(
    () => computeDocumentStats(editorState.markdown),
    [editorState.markdown],
  );
  const filteredThemes = useMemo(
    () => filterThemes(THEME_REGISTRY, themeQuery),
    [themeQuery],
  );

  useEffect(() => {
    persistDraft(editorState.markdown, selectedTheme.id);
  }, [editorState.markdown, selectedTheme.id, persistDraft]);

  useEffect(() => {
    updatePreview(editorState.markdown);
  }, [editorState.markdown, updatePreview]);

  useEffect(() => {
    return () => {
      persistDraft.cancel();
      updatePreview.cancel();
    };
  }, [persistDraft, updatePreview]);

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

  const handlePrintPdf = useCallback(() => {
    const htmlDocument = toThemedHtml(editorState.markdown, selectedTheme);
    printThemedArticle(htmlDocument);
    setActionStatus('Opened print dialog for PDF export.');
  }, [editorState.markdown, selectedTheme]);

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>Lobster Publisher Pro</h1>
        <p>
          {stats.wordCount} words · {stats.readingTimeMinutes} min read · {stats.lineCount} lines
        </p>
      </header>

      <section className="workspace-grid">
        <EditorPane
          markdown={editorState.markdown}
          onMarkdownChange={(markdown) => dispatch({ type: 'set_markdown', markdown })}
        />
        <ArticlePreview markdown={previewMarkdown} theme={selectedTheme} />
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
          <button type="button" onClick={handlePrintPdf}>
            Print / Save PDF
          </button>
        </div>
        {actionStatus ? <p className="action-status">{actionStatus}</p> : null}
      </section>

      <ThemePicker
        selectedThemeId={selectedTheme.id}
        themes={filteredThemes}
        onSelectTheme={setSelectedThemeId}
        themeQuery={themeQuery}
        onThemeQueryChange={setThemeQuery}
      />
    </main>
  );
}

export default App;
