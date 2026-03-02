import { describe, expect, it } from 'vitest';
import { THEME_REGISTRY } from '../theme';
import { toThemedHtml, toWechatHtml } from './htmlExporter';

describe('htmlExporter', () => {
  it('builds a full themed html document', () => {
    const html = toThemedHtml('# Heading', THEME_REGISTRY[0]);
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<h1>Heading</h1>');
  });

  it('builds wechat-safe html with inline styles', () => {
    const html = toWechatHtml('# Heading\n\nParagraph', THEME_REGISTRY[0]);
    expect(html).toContain('data-wechat-article="true"');
    expect(html).toContain('<h1 style=');
    expect(html).not.toContain('<style');
    expect(html).not.toContain('class=');
  });
});
