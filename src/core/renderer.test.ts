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

describe('renderMarkdownToHtml multi-image and table', () => {
  it('groups consecutive images into a grid container', () => {
    const md = '![img1](url1) ![img2](url2)';
    const html = renderMarkdownToHtml(md);
    expect(html).toContain('data-image-group="true"');
    expect(html).toContain('<div style="flex: 1; min-width: 0; padding: 2px;"><img src="url1"');
    expect(html).toContain('<div style="flex: 1; min-width: 0; padding: 2px;"><img src="url2"');
  });

  it('renders standard markdown tables', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |';
    const html = renderMarkdownToHtml(md);
    expect(html).toContain('<table');
    expect(html).toContain('<thead>');
    expect(html).toContain('<tbody>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
  });
});
