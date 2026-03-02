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

  it('preserves ordered list start index from rich text', () => {
    const html = '<ol start="3"><li>Third</li><li>Fourth</li></ol>';
    expect(richTextToMarkdown(html)).toBe('3. Third\n4. Fourth');
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

  // ── Feishu / Notion / Word paste edge-cases ─────────────────

  it('converts Feishu-style span bold via inline font-weight style', () => {
    const html = '<p><span style="font-weight: bold">Important</span> text</p>';
    expect(richTextToMarkdown(html)).toBe('**Important** text');
  });

  it('converts Notion-style span italic via inline font-style style', () => {
    const html = '<p><span style="font-style: italic">Emphasis</span> here</p>';
    expect(richTextToMarkdown(html)).toBe('*Emphasis* here');
  });

  it('converts span strikethrough via inline text-decoration style', () => {
    const html = '<p><span style="text-decoration: line-through">removed</span> kept</p>';
    expect(richTextToMarkdown(html)).toBe('~~removed~~ kept');
  });

  it('combines span bold+italic+strikethrough styles', () => {
    const html = '<p><span style="font-weight: 700; font-style: italic; text-decoration: line-through">combo</span></p>';
    expect(richTextToMarkdown(html)).toBe('***~~combo~~***');
  });

  it('converts Notion checkbox list items', () => {
    const html = `
      <ul>
        <li><input type="checkbox" checked />Done task</li>
        <li><input type="checkbox" />Todo task</li>
      </ul>
    `;
    const md = richTextToMarkdown(html);
    expect(md).toContain('- [x] Done task');
    expect(md).toContain('- [ ] Todo task');
  });

  it('converts <strike> tag to GFM tildes', () => {
    const html = '<p><strike>old text</strike></p>';
    expect(richTextToMarkdown(html)).toBe('~~old text~~');
  });

  it('extracts language from <pre><code class="language-js"> (Notion/Feishu paste)', () => {
    const html = '<pre><code class="language-js">const x = 1;</code></pre>';
    expect(richTextToMarkdown(html)).toBe('```js\nconst x = 1;\n```');
  });

  it('handles <figure> with <img> and <figcaption>', () => {
    const html = '<figure><img src="https://img.test/photo.jpg" alt="photo" /><figcaption>A nice photo</figcaption></figure>';
    const md = richTextToMarkdown(html);
    expect(md).toContain('![photo](https://img.test/photo.jpg)');
    expect(md).toContain('*A nice photo*');
  });

  it('expands colspan in table cells', () => {
    const html = `
      <table>
        <tr><th colspan="2">Header spanning two</th></tr>
        <tr><td>A</td><td>B</td></tr>
      </table>
    `;
    const md = richTextToMarkdown(html);
    expect(md).toContain('| Header spanning two | Header spanning two |');
    expect(md).toContain('| A | B |');
  });

  it('passes through <mark>, <u>, <ins> text without crashing', () => {
    const html = '<p><mark>highlighted</mark> and <u>underlined</u> and <ins>inserted</ins></p>';
    expect(richTextToMarkdown(html)).toBe('highlighted and underlined and inserted');
  });

  it('suppresses <meta>, <link>, <title>, <head> tags from Word paste', () => {
    const html = '<html><head><meta charset="utf-8"><title>Doc</title><style>body{}</style></head><body><p>Content</p></body></html>';
    expect(richTextToMarkdown(html)).toBe('Content');
  });

  it('handles Word-style numeric font-weight values (700, 800, 900)', () => {
    const html = '<p><span style="font-weight: 900">heavy</span></p>';
    expect(richTextToMarkdown(html)).toBe('**heavy**');
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
