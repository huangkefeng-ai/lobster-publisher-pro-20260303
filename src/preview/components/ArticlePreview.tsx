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

const Icons = {
  Desktop: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
  ),
  Tablet: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
  ),
  Mobile: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
  )
};

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

  const renderArticle = () => (
    <article className={`article-preview device-${device}`} style={toThemeCssVariables(theme)}>
      {content}
    </article>
  );

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
            aria-label="切换到电脑预览"
            title="电脑预览"
          >
            <Icons.Desktop />
          </button>
          <button 
            type="button" 
            className={device === 'tablet' ? 'active' : ''} 
            onClick={() => onDeviceChange('tablet')}
            aria-pressed={device === 'tablet'}
            aria-label="切换到平板预览"
            title="平板预览"
          >
            <Icons.Tablet />
          </button>
          <button 
            type="button" 
            className={device === 'mobile' ? 'active' : ''} 
            onClick={() => onDeviceChange('mobile')}
            aria-pressed={device === 'mobile'}
            aria-label="切换到手机预览"
            title="手机预览"
          >
            <Icons.Mobile />
          </button>
        </div>
      </header>
      <div className="article-preview-container">
        {device === 'desktop' ? (
          renderArticle()
        ) : (
          <div className={`device-shell shell-${device}`}>
            <div className="device-chrome">
              {device === 'mobile' && <div className="device-notch" />}
              <div className="device-button-group">
                <div className="device-button-v-up" />
                <div className="device-button-v-down" />
              </div>
              <div className="device-button-power" />
            </div>
            <div className="device-screen">
              {renderArticle()}
            </div>
            <div className="device-home-indicator" />
          </div>
        )}
      </div>
    </section>
  );
}
