import { useMemo, useRef } from 'react';

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
  const wordCount = useMemo(() => {
    return markdown.trim().length === 0 ? 0 : markdown.trim().split(/\s+/).length;
  }, [markdown]);

  function handleInsert(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onMarkdownChange(markdown + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = markdown.slice(0, start) + snippet + markdown.slice(end);
    onMarkdownChange(nextValue);

    requestAnimationFrame(() => {
      const cursor = start + snippet.length;
      textarea.focus();
      textarea.selectionStart = cursor;
      textarea.selectionEnd = cursor;
    });
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Markdown Editor</h2>
        <p>{wordCount} words</p>
      </header>
      <div className="toolbar" role="toolbar" aria-label="Editor snippets">
        {TOOLBAR_SNIPPETS.map((item) => (
          <button key={item.label} type="button" onClick={() => handleInsert(item.snippet)}>
            {item.label}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={markdown}
        onChange={(event) => onMarkdownChange(event.target.value)}
        spellCheck
      />
    </section>
  );
}
