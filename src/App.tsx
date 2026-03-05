import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
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

const PROJECT_REPO_URL = 'https://github.com/huangkefeng-ai/lobster-publisher-pro-20260303';
const UI_MODE_KEY = 'lobster-ui-mode';

type UiMode = 'light' | 'dark';

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
  const [uiMode, setUiMode] = useState<UiMode>(() => {
    const saved = localStorage.getItem(UI_MODE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const editorScrollRef = useRef<HTMLTextAreaElement | null>(null);
  const previewScrollRef = useRef<HTMLElement | null>(null);
  const isSyncingRef = useRef(false);

  const syncScroll = (source: 'editor' | 'preview') => {
    if (isSyncingRef.current) return;

    const editor = editorScrollRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return;

    isSyncingRef.current = true;

    const editorRange = editor.scrollHeight - editor.clientHeight;
    const previewRange = preview.scrollHeight - preview.clientHeight;

    if (source === 'editor') {
      const scrollRatio = editorRange > 0 ? editor.scrollTop / editorRange : 0;
      preview.scrollTop = previewRange > 0 ? scrollRatio * previewRange : 0;
    } else {
      const scrollRatio = previewRange > 0 ? preview.scrollTop / previewRange : 0;
      editor.scrollTop = editorRange > 0 ? scrollRatio * editorRange : 0;
    }

    // Use a small timeout to release the lock and avoid jitter
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 50);
  };

  const handleEditorScroll = () => syncScroll('editor');
  const handlePreviewScroll = () => syncScroll('preview');

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

  useEffect(() => {
    localStorage.setItem(UI_MODE_KEY, uiMode);
  }, [uiMode]);

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
    <main className={`app-shell ${uiMode === 'dark' ? 'ui-dark' : 'ui-light'}`}>
      <header className="hero">
        <div className="hero-content">
          <h1>Lobster 公众号排版助手</h1>
          <p>
            {stats.charCount} 字 · {stats.readingTimeMinutes} 分钟阅读 · {stats.lineCount} 行
          </p>
        </div>
        <div className="action-row">
          <a
            className="repo-link"
            href={PROJECT_REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="打开 GitHub 仓库"
            title="打开 GitHub 仓库"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
            <span>GitHub</span>
          </a>
          <button
            className="icon-toggle-btn"
            type="button"
            onClick={() => setUiMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            aria-label={uiMode === 'dark' ? '切换到白天模式' : '切换到黑夜模式'}
            title={uiMode === 'dark' ? '切换到白天模式' : '切换到黑夜模式'}
          >
            {uiMode === 'dark' ? (
              <Sun size={24} strokeWidth={2.2} aria-hidden="true" />
            ) : (
              <Moon size={24} strokeWidth={2.2} aria-hidden="true" />
            )}
          </button>
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
              onScroll={handleEditorScroll}
              textareaRef={editorScrollRef}
            />
            <ArticlePreview 
              markdown={previewMarkdown} 
              theme={selectedTheme} 
              device={device}
              onDeviceChange={setDevice}
              onScroll={handlePreviewScroll}
              previewRef={previewScrollRef}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
