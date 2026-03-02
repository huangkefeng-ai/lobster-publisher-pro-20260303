import { describe, expect, it } from 'vitest';
import { markdownFromClipboard, richTextToMarkdown } from './parser';

describe('richTextToMarkdown', () => {
  it('converts headings, emphasis, links, lists and blockquotes', () => {
    const html = `
      <h2>Article Title</h2>
      <p>Hello <strong>world</strong> and <a href="https://example.com">link</a>.</p>
      <ul><li>One</li><li>Two</li></ul>
      <blockquote><p>Takeaway line</p></blockquote>
    `;

    expect(richTextToMarkdown(html)).toBe(
      '## Article Title\n\nHello **world** and [link](https://example.com).\n\n- One\n- Two\n\n> Takeaway line',
    );
  });

  it('converts images and code blocks', () => {
    const html = '<p><img alt="diagram" src="https://img.test/a.png" /></p><pre>const a = 1;</pre>';
    expect(richTextToMarkdown(html)).toBe(
      '![diagram](https://img.test/a.png)\n\n```\nconst a = 1;\n```',
    );
  });

  it('keeps only safe image protocols in markdown images', () => {
    const html = `
      <p><img alt="safe" src="https://img.test/safe.png" /></p>
      <p><img alt="unsafe-data" src="data:image/png;base64,abcd" /></p>
      <p><img alt="unsafe-js" src="javascript:alert(1)" /></p>
      <p><img alt="relative" src="/images/x.png" /></p>
    `;

    expect(richTextToMarkdown(html)).toBe('![safe](https://img.test/safe.png)');
  });

  it('escapes literal markdown control characters in plain text', () => {
    const html = '<p>Use *stars* and _underscores_ literally.</p>';
    expect(richTextToMarkdown(html)).toBe('Use \\*stars\\* and \\_underscores\\_ literally.');
  });

  it('uses variable inline code fences when content has backticks', () => {
    const html = '<p><code>const key = `value`;</code></p>';
    expect(richTextToMarkdown(html)).toBe('``const key = `value`;``');
  });

  it('uses longer code block fences when content has triple backticks', () => {
    const html = '<pre>console.log("a");\n```\nconsole.log("b");</pre>';
    expect(richTextToMarkdown(html)).toBe('````\nconsole.log("a");\n```\nconsole.log("b");\n````');
  });

  it('preserves nested list structure from rich text', () => {
    const html = '<ul><li>Parent<ul><li>Child</li></ul></li></ul>';
    expect(richTextToMarkdown(html)).toBe('- Parent\n  - Child');
  });

  it('keeps only safe anchor protocols in markdown links', () => {
    const html = `
      <p><a href="https://example.com">https</a></p>
      <p><a href="mailto:test@example.com">mail</a></p>
      <p><a href="tel:+15551234567">phone</a></p>
      <p><a href="javascript:alert(1)">bad-js</a></p>
      <p><a href="data:text/html;base64,abcd">bad-data</a></p>
      <p><a href="/docs/page">relative</a></p>
    `;

    expect(richTextToMarkdown(html)).toBe(
      '[https](https://example.com)\n\n[mail](mailto:test@example.com)\n\n[phone](tel:+15551234567)\n\nbad-js\n\nbad-data\n\nrelative',
    );
  });

  it('drops unsafe href fallback text when an anchor has no visible content', () => {
    const html = '<p><a href="javascript:alert(1)"></a></p>';
    expect(richTextToMarkdown(html)).toBe('');
  });

  it('escapes closing brackets in markdown link text and image alt text', () => {
    const html = `
      <p><a href="https://example.com">docs] link</a></p>
      <p><img alt="chart] image" src="https://img.test/chart.png" /></p>
    `;

    expect(richTextToMarkdown(html)).toBe(
      '[docs\\] link](https://example.com)\n\n![chart\\] image](https://img.test/chart.png)',
    );
  });

  it('sanitizes markdown link and image destinations with control chars and parentheses', () => {
    const html = `
      <p><a href="https://example.com/foo)bar?q=1 2">docs</a></p>
      <p><img alt="chart" src="https://img.test/a)(b).png" /></p>
    `;

    expect(richTextToMarkdown(html)).toBe(
      '[docs](https://example.com/foo%29bar?q=1%202)\n\n![chart](https://img.test/a%29%28b%29.png)',
    );
  });

  it('converts strikethrough tags to GFM tildes', () => {
    const html = '<p>This is <del>removed</del> and <s>also struck</s> text.</p>';
    expect(richTextToMarkdown(html)).toBe('This is ~~removed~~ and ~~also struck~~ text.');
  });

  it('converts tables while ignoring empty rows and escaping pipe characters in cells', () => {
    const html = `
      <table>
        <tr></tr>
        <tr><th>Name</th><th>Role</th></tr>
        <tr><td>Lobster</td><td>Editor|Publisher</td></tr>
      </table>
    `;

    expect(richTextToMarkdown(html)).toBe(
      '| Name | Role |\n| --- | --- |\n| Lobster | Editor\\|Publisher |',
    );
  });

  it('normalizes table columns when rows have uneven cell counts', () => {
    const html = `
      <table>
        <tr><th>Name</th></tr>
        <tr><td>Lobster</td><td>Publisher</td></tr>
      </table>
    `;

    expect(richTextToMarkdown(html)).toBe(
      '| Name |  |\n| --- | --- |\n| Lobster | Publisher |',
    );
  });

  it('processes large 10k+ word clipboard html without freezing', () => {
    const wordsPerParagraph = 250;
    const paragraphCount = 40;
    const paragraph = Array.from({ length: wordsPerParagraph }, (_, index) => `word${index + 1}`).join(' ');
    const html = Array.from({ length: paragraphCount }, () => `<p>${paragraph}</p>`).join('');
    const inputWordCount = wordsPerParagraph * paragraphCount;

    const startedAt = performance.now();
    const markdown = richTextToMarkdown(html);
    const elapsedMs = performance.now() - startedAt;

    expect(markdown.split(/\s+/).length).toBeGreaterThanOrEqual(inputWordCount);
    expect(elapsedMs).toBeLessThan(4000);
  });
});

describe('markdownFromClipboard', () => {
  it('prefers html conversion when html is available', () => {
    const html = '<p>Formatted <strong>text</strong></p>';
    expect(markdownFromClipboard(html, 'fallback')).toBe('Formatted **text**');
  });

  it('falls back to plain text if html is empty', () => {
    expect(markdownFromClipboard('', 'plain content')).toBe('plain content');
  });
});
