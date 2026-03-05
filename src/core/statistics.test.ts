import { describe, expect, it } from 'vitest';
import { computeDocumentStats } from './statistics';

describe('computeDocumentStats', () => {
  it('returns zeros for empty input', () => {
    const stats = computeDocumentStats('');
    expect(stats).toEqual({ charCount: 0, wordCount: 0, lineCount: 0, readingTimeMinutes: 0 });
  });

  it('returns zeros for whitespace-only input', () => {
    const stats = computeDocumentStats('   \n  \n  ');
    expect(stats).toEqual({ charCount: 0, wordCount: 0, lineCount: 0, readingTimeMinutes: 0 });
  });

  it('counts Latin words correctly', () => {
    const stats = computeDocumentStats('Hello brave new world');
    expect(stats.wordCount).toBe(4);
    expect(stats.charCount).toBe(21);
    expect(stats.lineCount).toBe(1);
    expect(stats.readingTimeMinutes).toBe(1);
  });

  it('counts CJK characters as individual words', () => {
    const stats = computeDocumentStats('你好世界');
    expect(stats.wordCount).toBe(4);
  });

  it('handles mixed CJK and Latin text', () => {
    const stats = computeDocumentStats('Hello 你好 world');
    expect(stats.wordCount).toBe(4); // 2 latin + 2 CJK
  });

  it('counts multiple non-empty lines', () => {
    const stats = computeDocumentStats('Line one\n\nLine two\n   \nLine three');
    expect(stats.lineCount).toBe(3);
  });

  it('returns at least 1 minute reading time for non-empty content', () => {
    const stats = computeDocumentStats('short');
    expect(stats.readingTimeMinutes).toBe(1);
  });

  it('calculates reading time for longer content', () => {
    const words = Array.from({ length: 550 }, (_, i) => `word${i}`).join(' ');
    const stats = computeDocumentStats(words);
    expect(stats.readingTimeMinutes).toBe(2);
  });
});
