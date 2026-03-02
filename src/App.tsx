import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
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
  const statusTimerRef = useRef(0);

  function setTimedStatus(msg: string) {
    window.clearTimeout(statusTimerRef.current);
    setActionStatus(msg);
    statusTimerRef.current = window.setTimeout(() => setActionStatus(null), 4000);
  }

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

  useEffect(() => {
    return () => {
      window.clearTimeout(statusTimerRef.current);
    };
  }, []);

  async function handleCopyWechatHtml() {
    try {
      const wechatHtml = toWechatHtml(editorState.markdown, selectedTheme);
      await copyWechatHtmlToClipboard(wechatHtml);
      setTimedStatus('Copied WeChat-ready HTML to clipboard.');
    } catch {
      setTimedStatus('Copy failed. Check clipboard permissions and try again.');
    }
  }

  function handleDownloadHtml() {
    const htmlDocument = toThemedHtml(editorState.markdown, selectedTheme);
    downloadHtmlFile(`lobster-${selectedTheme.id}.html`, htmlDocument);
    setTimedStatus('Downloaded themed HTML file.');
  }

  const handlePrintPdf = useCallback(() => {
    const htmlDocument = toThemedHtml(editorState.markdown, selectedTheme);
    printThemedArticle(htmlDocument);
    setTimedStatus('Opened print dialog for PDF export.');
  }, [editorState.markdown, selectedTheme]);

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-content">
          <h1>Lobster Publisher Pro</h1>
          <p>
            {stats.wordCount} words · {stats.readingTimeMinutes} min read · {stats.lineCount} lines
          </p>
        </div>
        <div className="action-row">
          <button
            className="btn-primary"
            type="button"
            onClick={handleCopyWechatHtml}
            aria-label="Copy WeChat HTML to clipboard"
          >
            Copy WeChat HTML
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={handleDownloadHtml}
            aria-label="Export themed HTML file"
          >
            Export HTML
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={handlePrintPdf}
            aria-label="Open print dialog to save PDF"
          >
            Print / Save PDF
          </button>
        </div>
      </header>

      <p className="status-toast" role="status" aria-live="polite" aria-atomic="true">
        {actionStatus ?? ''}
      </p>

      <div className="app-body">
        <aside className="app-sidebar">
          <ThemePicker
            selectedThemeId={selectedTheme.id}
            themes={filteredThemes}
            onSelectTheme={setSelectedThemeId}
            themeQuery={themeQuery}
            onThemeQueryChange={setThemeQuery}
          />
        </aside>

        <section className="workspace-grid">
          <EditorPane
            markdown={editorState.markdown}
            onMarkdownChange={(markdown) => dispatch({ type: 'set_markdown', markdown })}
          />
          <ArticlePreview markdown={previewMarkdown} theme={selectedTheme} />
        </section>
      </div>
    </main>
  );
}

export default App;
