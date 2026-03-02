import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import { markdownFromClipboard, computeDocumentStats } from '../../core';
import { handleEditorShortcut } from '../shortcuts';
import { processImageFile } from '../../images';

interface EditorPaneProps {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
}

const TOOLBAR_SNIPPETS: Array<{ label: string; snippet: string }> = [
  { label: '二级标题', snippet: '\n## 新段落\n' },
  { label: '引用', snippet: '\n> 核心观点\n' },
  { label: '列表', snippet: '\n- 要点一\n- 要点二\n' },
  { label: '代码', snippet: '\n```\n示例代码\n```\n' },
  { label: '分割线', snippet: '\n---\n' },
];

function escapeMarkdownAltText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

export function EditorPane({ markdown, onMarkdownChange }: EditorPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const wordCount = useMemo(() => computeDocumentStats(markdown).wordCount, [markdown]);
  const pasteStatusTimerRef = useRef<number | null>(null);

  const [pasteStatus, setPasteStatus] = useState<{ status: 'success' | 'error', message: string } | null>(null);

  function showPasteStatus(status: 'success' | 'error', message: string) {
    if (pasteStatusTimerRef.current !== null) {
      window.clearTimeout(pasteStatusTimerRef.current);
    }
    setPasteStatus({ status, message });
    pasteStatusTimerRef.current = window.setTimeout(() => {
      setPasteStatus(null);
      pasteStatusTimerRef.current = null;
    }, 3000);
  }

  useEffect(
    () => () => {
      if (pasteStatusTimerRef.current !== null) {
        window.clearTimeout(pasteStatusTimerRef.current);
      }
    },
    [],
  );

  function handleInsert(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onMarkdownChange(markdown + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    const nextValue = currentValue.slice(0, start) + snippet + currentValue.slice(end);
    onMarkdownChange(nextValue);

    requestAnimationFrame(() => {
      const cursor = start + snippet.length;
      textarea.focus();
      textarea.selectionStart = cursor;
      textarea.selectionEnd = cursor;
    });
  }

  async function handleImageFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;

    const file = Array.from(files).find(f => f.type.startsWith('image/'));
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const base64 = await processImageFile(file);
      const snippet = `\n![${escapeMarkdownAltText(file.name)}](${base64})\n`;
      handleInsert(snippet);
      showPasteStatus('success', '图片已成功插入');
    } catch {
      setUploadError('图片处理失败，请尝试其他图片。');
      showPasteStatus('error', '图片处理失败');
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLTextAreaElement>) {
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const hasImage = Array.from(files).some(f => f.type.startsWith('image/'));
      if (hasImage) {
        event.preventDefault();
        handleImageFiles(files);
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const result = handleEditorShortcut(
      event,
      markdown,
      textarea.selectionStart,
      textarea.selectionEnd,
    );

    if (result) {
      event.preventDefault();
      onMarkdownChange(result.value);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.selectionStart = result.selectionStart;
        textarea.selectionEnd = result.selectionEnd;
      });
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files = event.clipboardData.files;
    if (files && files.length > 0) {
      const hasImage = Array.from(files).some(f => f.type.startsWith('image/'));
      if (hasImage) {
        event.preventDefault();
        handleImageFiles(files);
        return;
      }
    }

    const html = event.clipboardData.getData('text/html');
    if (html.trim().length === 0) {
      return;
    }

    const plainText = event.clipboardData.getData('text/plain');
    const converted = markdownFromClipboard(html, plainText);
    if (converted.trim().length === 0) {
      showPasteStatus('error', '未能识别有效内容');
      return;
    }

    event.preventDefault();
    const start = event.currentTarget.selectionStart;
    const end = event.currentTarget.selectionEnd;
    const currentValue = event.currentTarget.value;
    const nextValue = currentValue.slice(0, start) + converted + currentValue.slice(end);
    onMarkdownChange(nextValue);
    showPasteStatus('success', '魔法粘贴成功，已转换为 Markdown');

    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      const cursor = start + converted.length;
      ta.focus();
      ta.selectionStart = cursor;
      ta.selectionEnd = cursor;
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleImageFiles(event.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <section className="panel editor-panel">
      <header className="panel-header">
        <h2>Markdown 编辑器</h2>
        <p>{wordCount} 字 {isUploading && '· 处理图片中...'}</p>
        {uploadError ? <p className="error-text" role="alert">{uploadError}</p> : null}
      </header>
      <div className="toolbar" role="toolbar" aria-label="编辑器片段">
        {TOOLBAR_SNIPPETS.map((item) => (
          <button key={item.label} type="button" onClick={() => handleInsert(item.snippet)} disabled={isUploading}>
            {item.label}
          </button>
        ))}
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading}
          title="上传或粘贴图片"
          className="upload-btn"
        >
          {isUploading ? '上传中...' : '图片'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
        {pasteStatus && (
          <span className={`paste-status ${pasteStatus.status}`} role="status" aria-live="polite">
            {pasteStatus.message}
          </span>
        )}
      </div>
      <div className="editor-container">
        {isUploading && (
          <div className="loading-overlay">
            <span className="loading-spinner"></span>
            <p>处理图片中...</p>
          </div>
        )}
        <textarea
          ref={textareaRef}
          className={`editor-textarea ${markdown.length === 0 ? 'empty-state' : ''}`}
          aria-label="Markdown 编辑器"
          placeholder="在此输入或粘贴 Markdown 内容...
支持魔法粘贴，保留排版：
- 从 飞书 / Notion / Word 等富文本编辑器直接粘贴
- 从 网页内容 (带链接、图片) 直接复制粘贴"
          value={markdown}
          onChange={(event) => onMarkdownChange(event.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          spellCheck
          disabled={isUploading}
        />
      </div>
    </section>
  );
}
