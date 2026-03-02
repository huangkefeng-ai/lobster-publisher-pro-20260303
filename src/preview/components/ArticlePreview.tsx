import { useMemo } from 'react';
import { renderMarkdownToHtml } from '../../core';
import type { ThemeDefinition } from '../../theme';
import { toThemeCssVariables } from '../../theme';

interface ArticlePreviewProps {
  markdown: string;
  theme: ThemeDefinition;
}

export function ArticlePreview({ markdown, theme }: ArticlePreviewProps) {
  const html = useMemo(() => renderMarkdownToHtml(markdown), [markdown]);

  return (
    <section className="panel preview-panel" aria-labelledby="preview-heading">
      <header className="panel-header">
        <h2 id="preview-heading">Live Preview</h2>
        <p>{theme.name}</p>
      </header>
      <article className="article-preview" style={toThemeCssVariables(theme)}>
        {html.trim() ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="preview-empty">No content to preview</div>
        )}
      </article>
    </section>
  );
}
