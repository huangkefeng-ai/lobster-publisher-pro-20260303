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

  it('keeps safe tel links and strips unsafe URI protocols', () => {
    const html = `
      <p><a href="tel:+15551234567">phone</a></p>
      <p><a href="javascript:alert(1)">bad</a></p>
    `;

    const sanitized = sanitizeWechatHtml(html);

    expect(sanitized).toContain('<a href="tel:+15551234567">phone</a>');
    expect(sanitized).toContain('<a>bad</a>');
    expect(sanitized).not.toContain('javascript:');
  });

  it('keeps base64 data image src but strips non-image data URIs', () => {
    const html = `
      <p><img alt="safe" src="data:image/png;base64,abcd" /></p>
      <p><a href="data:text/html;base64,abcd">bad-data</a></p>
    `;

    const sanitized = sanitizeWechatHtml(html);

    expect(sanitized).toContain('<img alt="safe" src="data:image/png;base64,abcd">');
    expect(sanitized).toContain('<a>bad-data</a>');
    expect(sanitized).not.toContain('data:text/html');
  });
});
