import { useMemo } from 'react';
import { htmlExportPipeline } from '../../pipeline';
import { PublishErrorCode } from '../../core';
import type { ThemeDefinition } from '../../theme';
import { toThemeCssVariables } from '../../theme';

interface ArticlePreviewProps {
  markdown: string;
  theme: ThemeDefinition;
}

export function ArticlePreview({ markdown, theme }: ArticlePreviewProps) {
  const htmlResult = useMemo(() => htmlExportPipeline(markdown, theme), [markdown, theme]);

  let content = null;
  if (!htmlResult.ok) {
    if (htmlResult.error.code !== PublishErrorCode.EMPTY_INPUT) {
      content = <div className="error-text">Preview error: {htmlResult.error.message}</div>;
    } else {
      content = <div className="preview-empty">No content to preview</div>;
    }
  } else {
    content = <div dangerouslySetInnerHTML={{ __html: htmlResult.value.html }} />;
  }

  return (
    <section className="panel preview-panel" aria-labelledby="preview-heading">
      <header className="panel-header">
        <h2 id="preview-heading">Live Preview</h2>
        <p>{theme.name}</p>
      </header>
      <article className="article-preview" style={toThemeCssVariables(theme)}>
        {content}
      </article>
    </section>
  );
}
