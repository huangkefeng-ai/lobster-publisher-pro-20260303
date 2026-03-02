import { useMemo } from 'react';
import { htmlExportPipeline } from '../../pipeline';
import { PublishErrorCode } from '../../core';
import type { ThemeDefinition } from '../../theme';
import { toThemeCssVariables } from '../../theme';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface ArticlePreviewProps {
  markdown: string;
  theme: ThemeDefinition;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

export function ArticlePreview({ markdown, theme, device, onDeviceChange }: ArticlePreviewProps) {
  const htmlResult = useMemo(() => htmlExportPipeline(markdown, theme), [markdown, theme]);

  let content = null;
  if (!htmlResult.ok) {
    if (htmlResult.error.code !== PublishErrorCode.EMPTY_INPUT) {
      content = <div className="error-text">预览错误: {htmlResult.error.message}</div>;
    } else {
      content = <div className="preview-empty">暂无内容可预览</div>;
    }
  } else {
    content = <div dangerouslySetInnerHTML={{ __html: htmlResult.value.html }} />;
  }

  return (
    <section className="panel preview-panel" aria-labelledby="preview-heading">
      <header className="panel-header" style={{ width: '100%' }}>
        <h2 id="preview-heading">实时预览</h2>
        <div className="preview-controls" role="group" aria-label="设备预览切换">
          <button 
            type="button" 
            className={device === 'desktop' ? 'active' : ''} 
            onClick={() => onDeviceChange('desktop')}
            aria-pressed={device === 'desktop'}
          >
            PC
          </button>
          <button 
            type="button" 
            className={device === 'tablet' ? 'active' : ''} 
            onClick={() => onDeviceChange('tablet')}
            aria-pressed={device === 'tablet'}
          >
            平板
          </button>
          <button 
            type="button" 
            className={device === 'mobile' ? 'active' : ''} 
            onClick={() => onDeviceChange('mobile')}
            aria-pressed={device === 'mobile'}
          >
            手机
          </button>
        </div>
      </header>
      <div className="article-preview-container">
        <article className={`article-preview device-${device}`} style={toThemeCssVariables(theme)}>
          {content}
        </article>
      </div>
    </section>
  );
}
