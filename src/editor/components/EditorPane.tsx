import { useMemo, useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react';
import { markdownFromClipboard, computeDocumentStats } from '../../core';
import { handleEditorShortcut } from '../shortcuts';
import { processImageFile } from '../../images';

interface EditorPaneProps {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
}

const TOOLBAR_SNIPPETS: Array<{ label: string; snippet: string }> = [
  { label: 'H2', snippet: '\n## New Section\n' },
  { label: 'Quote', snippet: '\n> Key takeaway\n' },
  { label: 'List', snippet: '\n- Point one\n- Point two\n' },
  { label: 'Code', snippet: '\n```\ncode sample\n```\n' },
  { label: 'Divider', snippet: '\n---\n' },
];

export function EditorPane({ markdown, onMarkdownChange }: EditorPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const wordCount = useMemo(() => computeDocumentStats(markdown).wordCount, [markdown]);

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
    try {
      const base64 = await processImageFile(file);
      const snippet = `\n![${file.name}](${base64})\n`;
      handleInsert(snippet);
    } catch (error) {
      console.error('Failed to process image:', error);
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
      return;
    }

    event.preventDefault();
    const start = event.currentTarget.selectionStart;
    const end = event.currentTarget.selectionEnd;
    const currentValue = event.currentTarget.value;
    const nextValue = currentValue.slice(0, start) + converted + currentValue.slice(end);
    onMarkdownChange(nextValue);

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
    <section className="panel">
      <header className="panel-header">
        <h2>Markdown Editor</h2>
        <p>{wordCount} words {isUploading && '· Processing image...'}</p>
      </header>
      <div className="toolbar" role="toolbar" aria-label="Editor snippets">
        {TOOLBAR_SNIPPETS.map((item) => (
          <button key={item.label} type="button" onClick={() => handleInsert(item.snippet)} disabled={isUploading}>
            {item.label}
          </button>
        ))}
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading}
          title="Upload or paste image"
        >
          Image
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        aria-label="Markdown editor"
        value={markdown}
        onChange={(event) => onMarkdownChange(event.target.value)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        spellCheck
        disabled={isUploading}
      />
    </section>
  );
}
