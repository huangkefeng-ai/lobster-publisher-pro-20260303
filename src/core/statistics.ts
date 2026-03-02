const CJK_RANGE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;
const WORD_SPLIT = /\s+/;
const WORDS_PER_MINUTE = 275;

export interface DocumentStats {
  charCount: number;
  wordCount: number;
  lineCount: number;
  readingTimeMinutes: number;
}

export function computeDocumentStats(markdown: string): DocumentStats {
  const trimmed = markdown.trim();

  if (trimmed.length === 0) {
    return { charCount: 0, wordCount: 0, lineCount: 0, readingTimeMinutes: 0 };
  }

  const charCount = trimmed.length;
  const lineCount = trimmed.split('\n').length;

  const cjkMatches = trimmed.match(CJK_RANGE);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  const withoutCjk = trimmed.replace(CJK_RANGE, ' ').trim();
  const latinWords = withoutCjk.length === 0 ? 0 : withoutCjk.split(WORD_SPLIT).filter((w) => w.length > 0).length;

  const wordCount = latinWords + cjkCount;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

  return { charCount, wordCount, lineCount, readingTimeMinutes };
}
