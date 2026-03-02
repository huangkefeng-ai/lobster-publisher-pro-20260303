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
