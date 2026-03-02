import { describe, expect, it } from 'vitest';
import { renderMarkdownToHtml } from './renderer';

describe('renderMarkdownToHtml syntax highlighting', () => {
  it('renders fenced code blocks with inline-style syntax highlighting', () => {
    const md = '```js\nconst x = 1;\n```';
    const html = renderMarkdownToHtml(md);
    expect(html).toContain('<pre');
    expect(html).toContain('<code>');
    expect(html).toContain('<span style="color:');
    expect(html).toContain('const');
  });

  it('renders code blocks without language as plain escaped text', () => {
    const md = '```\n<div>hello</div>\n```';
    const html = renderMarkdownToHtml(md);
    expect(html).toContain('&lt;div&gt;');
    expect(html).not.toContain('<div>hello</div>');
  });

  it('preserves span elements through DOMPurify sanitization', () => {
    const md = '```ts\nconst n: number = 42;\n```';
    const html = renderMarkdownToHtml(md);
    expect(html).toContain('<span style=');
  });

  it('sets data-lang attribute on pre element', () => {
    const md = '```python\nprint("hello")\n```';
    const html = renderMarkdownToHtml(md);
    expect(html).toContain('data-lang="python"');
  });

  it('renders multiple code blocks independently', () => {
    const md = '```js\nconst a = 1;\n```\n\nSome text\n\n```python\ndef f(): pass\n```';
    const html = renderMarkdownToHtml(md);
    const preCount = (html.match(/<pre/g) ?? []).length;
    expect(preCount).toBe(2);
  });

  it('does not add data-lang when no language specified', () => {
    const md = '```\nplain code\n```';
    const html = renderMarkdownToHtml(md);
    expect(html).not.toContain('data-lang');
  });

  it('handles inline code without highlighting (unchanged)', () => {
    const md = 'Use `const x = 1` inline.';
    const html = renderMarkdownToHtml(md);
    expect(html).toContain('<code>const x = 1</code>');
    expect(html).not.toContain('<span style=');
  });
});
