import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemo } from 'react';
import type { ThemeDefinition } from '../../theme/themeTypes';
import { toThemeCssVariables } from '../../theme/themeCss';

interface ArticlePreviewProps {
  markdown: string;
  theme: ThemeDefinition;
}

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function ArticlePreview({ markdown, theme }: ArticlePreviewProps) {
  const html = useMemo(() => {
    const parsed = marked.parse(markdown, { async: false });
    return DOMPurify.sanitize(parsed);
  }, [markdown]);

  return (
    <section className="panel preview-panel">
      <header className="panel-header">
        <h2>Live Preview</h2>
        <p>{theme.name}</p>
      </header>
      <article className="article-preview" style={toThemeCssVariables(theme)}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </section>
  );
}
