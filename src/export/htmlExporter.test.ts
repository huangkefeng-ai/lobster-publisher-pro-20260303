import { afterEach, describe, expect, it, vi } from 'vitest';
import { THEME_REGISTRY } from '../theme';
import { downloadHtmlFile, toThemedHtml, toWechatHtml } from './htmlExporter';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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

  it('downloads html and cleans up blob url', () => {
    vi.useFakeTimers();
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadHtmlFile('article.html', '<h1>Export</h1>');

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    expect(appendChildSpy).toHaveBeenCalledOnce();
    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('article.html');
    expect(anchor.href).toBe('blob:mock-url');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(document.body.contains(anchor)).toBe(true);

    vi.runAllTimers();

    expect(document.body.contains(anchor)).toBe(false);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('does not fail cleanup when anchor was detached early', () => {
    vi.useFakeTimers();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadHtmlFile('article.html', '<h1>Export</h1>');

    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
    anchor.remove();

    expect(() => vi.runAllTimers()).not.toThrow();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('sanitizes unsafe filename characters and control bytes', () => {
    vi.useFakeTimers();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadHtmlFile('bad/name\u0000?.html', '<h1>Export</h1>');

    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('bad_name__.html');
  });

  it('falls back to export.html when filename is empty', () => {
    vi.useFakeTimers();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadHtmlFile('', '<h1>Export</h1>');

    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('export.html');
  });
});
