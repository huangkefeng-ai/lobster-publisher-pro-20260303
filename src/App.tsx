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
import { ArticlePreview, type DeviceType } from './preview';
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
  const [device, setDevice] = useState<DeviceType>('desktop');
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
      if (!wechatHtml) {
        setTimedStatus('没有内容可复制。');
        return;
      }
      await copyWechatHtmlToClipboard(wechatHtml);
      setTimedStatus('已复制公众号兼容的 HTML 到剪贴板。');
    } catch {
      setTimedStatus('复制失败。请检查剪贴板权限后重试。');
    }
  }

  function handleDownloadHtml() {
    try {
      const htmlDocument = toThemedHtml(editorState.markdown, selectedTheme);
      if (!htmlDocument) {
        setTimedStatus('没有内容可导出。');
        return;
      }
      downloadHtmlFile(`lobster-${selectedTheme.id}.html`, htmlDocument);
      setTimedStatus('已下载带主题的 HTML 文件。');
    } catch {
      setTimedStatus('导出失败。');
    }
  }

  const handlePrintPdf = useCallback(() => {
    try {
      const htmlDocument = toThemedHtml(editorState.markdown, selectedTheme);
      if (!htmlDocument) {
        setTimedStatus('没有内容可打印。');
        return;
      }
      printThemedArticle(htmlDocument);
      setTimedStatus('已打开打印对话框以导出 PDF。');
    } catch {
      setTimedStatus('PDF 导出失败。');
    }
  }, [editorState.markdown, selectedTheme]);

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-content">
          <h1>Lobster 公众号排版助手</h1>
          <p>
            {stats.wordCount} 字 · {stats.readingTimeMinutes} 分钟阅读 · {stats.lineCount} 行
          </p>
        </div>
        <div className="action-row">
          <button
            className="btn-primary"
            type="button"
            onClick={handleCopyWechatHtml}
            aria-label="复制公众号 HTML 到剪贴板"
          >
            复制公众号 HTML
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={handleDownloadHtml}
            aria-label="导出带主题的 HTML 文件"
          >
            导出 HTML
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={handlePrintPdf}
            aria-label="打开打印对话框以保存 PDF"
          >
            打印 / 导出 PDF
          </button>
        </div>
      </header>

      <p 
        className="status-toast" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        style={{ display: actionStatus ? 'block' : 'none' }}
      >
        {actionStatus ?? ''}
      </p>

      <div className="app-body">
        <div className="main-workspace">
          <ThemePicker
            selectedThemeId={selectedTheme.id}
            themes={filteredThemes}
            onSelectTheme={setSelectedThemeId}
            themeQuery={themeQuery}
            onThemeQueryChange={setThemeQuery}
          />
          <section className={`workspace-grid device-${device}`}>
            <EditorPane
              markdown={editorState.markdown}
              onMarkdownChange={(markdown) => dispatch({ type: 'set_markdown', markdown })}
            />
            <ArticlePreview 
              markdown={previewMarkdown} 
              theme={selectedTheme} 
              device={device}
              onDeviceChange={setDevice}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
