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

const Icons = {
  Github: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
  )
};

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
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const toggleThemeMode = () => {
    setIsDarkMode((prev) => !prev);
  };

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
            aria-label="打开打印对话框以保存为 PDF"
          >
            保存为 PDF
          </button>
          <a
            href="https://github.com/huangkefeng-ai/lobster-publisher-pro-20260303"
            target="_blank"
            rel="noopener noreferrer"
            className="header-icon-link"
            title="查看 GitHub 仓库"
          >
            <Icons.Github />
          </a>
          <button
            className="header-icon-btn"
            type="button"
            onClick={toggleThemeMode}
            title={isDarkMode ? '切换到白天模式' : '切换到夜间模式'}
          >
            {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
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
