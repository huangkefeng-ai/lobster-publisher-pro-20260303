import { describe, expect, it } from 'vitest';
import { validateMarkdown, validateImageFile } from './validator';
import { PublishErrorCode } from './errors';

describe('validateMarkdown', () => {
  it('accepts valid markdown and returns trimmed value', () => {
    const result = validateMarkdown('  # Hello  ');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('# Hello');
    }
  });

  it('rejects empty string with EMPTY_INPUT', () => {
    const result = validateMarkdown('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.EMPTY_INPUT);
    }
  });

  it('rejects whitespace-only string with EMPTY_INPUT', () => {
    const result = validateMarkdown('   \n\t  ');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.EMPTY_INPUT);
    }
  });

  it('rejects markdown exceeding 500 KB with VALIDATION_FAILED', () => {
    // 512_001 bytes of ASCII = just over the 512_000 byte limit
    const oversized = 'a'.repeat(512_001);
    const result = validateMarkdown(oversized);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.VALIDATION_FAILED);
      expect(result.error.message).toContain('exceeds maximum size');
    }
  });

  it('accepts markdown at exactly 500 KB', () => {
    const exact = 'a'.repeat(512_000);
    const result = validateMarkdown(exact);
    expect(result.ok).toBe(true);
  });

  it('counts multi-byte characters correctly against byte limit', () => {
    // Each CJK character is 3 bytes in UTF-8, so 170_667 chars = 512_001 bytes
    const cjk = '字'.repeat(170_667);
    const result = validateMarkdown(cjk);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.VALIDATION_FAILED);
    }
  });
});

describe('validateImageFile', () => {
  it('accepts image/jpeg', () => {
    const result = validateImageFile({ type: 'image/jpeg', size: 1024 });
    expect(result.ok).toBe(true);
  });

  it('accepts image/png', () => {
    const result = validateImageFile({ type: 'image/png', size: 1024 });
    expect(result.ok).toBe(true);
  });

  it('accepts image/gif', () => {
    const result = validateImageFile({ type: 'image/gif', size: 1024 });
    expect(result.ok).toBe(true);
  });

  it('accepts image/webp', () => {
    const result = validateImageFile({ type: 'image/webp', size: 1024 });
    expect(result.ok).toBe(true);
  });

  it('accepts image/svg+xml', () => {
    const result = validateImageFile({ type: 'image/svg+xml', size: 1024 });
    expect(result.ok).toBe(true);
  });

  it('rejects unsupported MIME type with VALIDATION_FAILED', () => {
    const result = validateImageFile({ type: 'application/pdf', size: 1024 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.VALIDATION_FAILED);
      expect(result.error.message).toContain('application/pdf');
    }
  });

  it('rejects files exceeding 10 MB with IMAGE_TOO_LARGE', () => {
    const overLimit = 10 * 1024 * 1024 + 1;
    const result = validateImageFile({ type: 'image/png', size: overLimit });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.IMAGE_TOO_LARGE);
      expect(result.error.message).toContain('10 MB');
    }
  });

  it('accepts files at exactly 10 MB', () => {
    const exact = 10 * 1024 * 1024;
    const result = validateImageFile({ type: 'image/png', size: exact });
    expect(result.ok).toBe(true);
  });
});
