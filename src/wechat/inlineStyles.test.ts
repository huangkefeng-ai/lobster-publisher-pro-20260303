import { describe, expect, it } from 'vitest';
import { THEME_REGISTRY } from '../theme';
import { applyWechatInlineStyles } from './inlineStyles';

describe('applyWechatInlineStyles', () => {
  it('adds theme-driven inline styles to key tags', () => {
    const theme = THEME_REGISTRY[0];
    const html = '<h1>Hello</h1><p>Paragraph with <a href="https://example.com">link</a>.</p>';

    const result = applyWechatInlineStyles(html, theme);

    expect(result).toContain('data-wechat-article="true"');
    expect(result).toContain('<h1 style=');
    expect(result).toContain('<p style=');
    expect(result).toContain('<a href="https://example.com" style=');
    expect(result).toContain(theme.tokens.heading);
    expect(result).toContain(theme.tokens.accent);
  });

  it('preserves existing inline styles while applying theme styles', () => {
    const theme = THEME_REGISTRY[0];
    const html =
      '<p style="margin: 2em 0; background-image: url(https://example.com/a:b.png)">Paragraph</p>';

    const result = applyWechatInlineStyles(html, theme);

    expect(result).toContain('margin: 2em 0');
    expect(result).toContain('background-image: url(https://example.com/a:b.png)');
    expect(result).toContain(`color: ${theme.tokens.text}`);
  });

  it('applies grid styles to multi-image groups', () => {
    const theme = THEME_REGISTRY[0];
    const html = '<div data-image-group="true"><div><img src="img1"></div><div><img src="img2"></div></div>';
    const result = applyWechatInlineStyles(html, theme);
    expect(result).toContain('display: flex');
    expect(result).toContain('flex: 1');
    expect(result).toContain('width: 100%');
  });

  it('applies borders and padding to tables', () => {
    const theme = THEME_REGISTRY[0];
    const html = '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
    const result = applyWechatInlineStyles(html, theme);
    expect(result).toContain('border-collapse: collapse');
    expect(result).toContain('border: 1px solid');
    expect(result).toContain('padding: 0.6em 0.8em');
  });
});
