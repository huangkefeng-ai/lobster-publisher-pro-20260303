import { describe, expect, it } from 'vitest';
import { sanitizeWechatHtml } from './sanitizer';

describe('sanitizeWechatHtml', () => {
  it('strips scripts and unsupported attributes', () => {
    const html = `
      <div class="x" id="y" onclick="hack()">
        <h2>Safe title</h2>
        <script>alert('x')</script>
        <p><a href="https://example.com" target="_blank">link</a></p>
      </div>
    `;

    const sanitized = sanitizeWechatHtml(html);

    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('class=');
    expect(sanitized).not.toContain('id=');
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).toContain('<h2>Safe title</h2>');
    expect(sanitized).toContain('<a href="https://example.com">link</a>');
  });
});
