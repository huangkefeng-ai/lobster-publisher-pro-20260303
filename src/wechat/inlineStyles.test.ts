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
});
