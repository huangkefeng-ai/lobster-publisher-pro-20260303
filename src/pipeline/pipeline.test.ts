import { describe, expect, it } from 'vitest';
import type { ThemeDefinition } from '../theme/themeTypes';
import type { PipelineContext, PipelineStep } from './types';
import { PublishErrorCode, ok, err } from '../core/errors';
import { runPipeline } from './runner';
import {
  validateStep,
  renderStep,
  sanitizeWechatStep,
  inlineStyleStep,
} from './steps';
import {
  wechatPipeline,
  htmlExportPipeline,
  pdfPrintPipeline,
} from './pipelines';

const TEST_THEME: ThemeDefinition = {
  id: 'test-theme',
  name: 'Test Theme',
  family: 'test',
  tokens: {
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#000000',
    heading: '#111111',
    accent: '#0066cc',
    border: '#cccccc',
    quoteBackground: '#f9f9f9',
    quoteBorder: '#999999',
    codeBackground: '#eeeeee',
    bodyFont: 'sans-serif',
    headingFont: 'sans-serif',
  },
};

function makeContext(overrides: Partial<PipelineContext> = {}): PipelineContext {
  return { markdown: '# Test', theme: TEST_THEME, ...overrides };
}

// ── runPipeline ──────────────────────────────────────────────

describe('runPipeline', () => {
  it('returns output with final html and target when all steps succeed', () => {
    const passthrough: PipelineStep = {
      name: 'passthrough',
      execute: (ctx) => ok({ ...ctx, html: '<p>done</p>' }),
    };
    const result = runPipeline([passthrough], makeContext(), 'wechat');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.html).toBe('<p>done</p>');
      expect(result.value.target).toBe('wechat');
    }
  });

  it('short-circuits on the first failing step', () => {
    let secondCalled = false;
    const fail: PipelineStep = {
      name: 'fail',
      execute: () => err(PublishErrorCode.RENDER_FAILED, 'boom'),
    };
    const spy: PipelineStep = {
      name: 'spy',
      execute: (ctx) => {
        secondCalled = true;
        return ok(ctx);
      },
    };
    const result = runPipeline([fail, spy], makeContext(), 'wechat');
    expect(result.ok).toBe(false);
    expect(secondCalled).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.RENDER_FAILED);
    }
  });

  it('returns empty html when no step sets ctx.html', () => {
    const noop: PipelineStep = { name: 'noop', execute: (ctx) => ok(ctx) };
    const result = runPipeline([noop], makeContext(), 'html-export');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.html).toBe('');
    }
  });

  it('threads context through multiple steps in order', () => {
    const step1: PipelineStep = {
      name: 'step1',
      execute: (ctx) => ok({ ...ctx, html: 'A' }),
    };
    const step2: PipelineStep = {
      name: 'step2',
      execute: (ctx) => ok({ ...ctx, html: (ctx.html ?? '') + 'B' }),
    };
    const result = runPipeline([step1, step2], makeContext(), 'pdf-print');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.html).toBe('AB');
    }
  });
});

// ── validateStep ─────────────────────────────────────────────

describe('validateStep', () => {
  it('passes valid markdown through and trims it', () => {
    const result = validateStep.execute(makeContext({ markdown: '  # Hello  ' }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.markdown).toBe('# Hello');
    }
  });

  it('rejects empty markdown', () => {
    const result = validateStep.execute(makeContext({ markdown: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.EMPTY_INPUT);
    }
  });

  it('has name "validate"', () => {
    expect(validateStep.name).toBe('validate');
  });
});

// ── renderStep ───────────────────────────────────────────────

describe('renderStep', () => {
  it('renders markdown to HTML and sets ctx.html', () => {
    const result = renderStep.execute(makeContext({ markdown: '**bold**' }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.html).toContain('<strong>bold</strong>');
    }
  });

  it('has name "render"', () => {
    expect(renderStep.name).toBe('render');
  });
});

// ── sanitizeWechatStep ───────────────────────────────────────

describe('sanitizeWechatStep', () => {
  it('strips disallowed tags from HTML', () => {
    const ctx = makeContext({ html: '<p>ok</p><script>bad</script>' });
    const result = sanitizeWechatStep.execute(ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.html).toContain('<p>ok</p>');
      expect(result.value.html).not.toContain('<script>');
    }
  });

  it('returns error when ctx.html is undefined', () => {
    const result = sanitizeWechatStep.execute(makeContext());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.SANITIZE_FAILED);
    }
  });

  it('has name "sanitize-wechat"', () => {
    expect(sanitizeWechatStep.name).toBe('sanitize-wechat');
  });
});

// ── inlineStyleStep ──────────────────────────────────────────

describe('inlineStyleStep', () => {
  it('applies inline styles and sets styledHtml', () => {
    const ctx = makeContext({ html: '<p>hello</p>' });
    const result = inlineStyleStep.execute(ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.html).toContain('style=');
      expect(result.value.styledHtml).toBeDefined();
    }
  });

  it('returns error when ctx.html is undefined', () => {
    const result = inlineStyleStep.execute(makeContext());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.RENDER_FAILED);
    }
  });

  it('has name "inline-styles"', () => {
    expect(inlineStyleStep.name).toBe('inline-styles');
  });
});

// ── pre-built pipelines ──────────────────────────────────────

describe('wechatPipeline', () => {
  it('produces styled HTML for valid markdown', () => {
    const result = wechatPipeline('# Title\n\nParagraph.', TEST_THEME);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.target).toBe('wechat');
      expect(result.value.html).toContain('style=');
      expect(result.value.html).toContain('Title');
    }
  });

  it('fails for empty markdown without throwing', () => {
    const result = wechatPipeline('', TEST_THEME);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(PublishErrorCode.EMPTY_INPUT);
    }
  });
});

describe('htmlExportPipeline', () => {
  it('produces rendered HTML for valid markdown', () => {
    const result = htmlExportPipeline('**bold**', TEST_THEME);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.target).toBe('html-export');
      expect(result.value.html).toContain('<strong>bold</strong>');
    }
  });

  it('fails for empty markdown', () => {
    const result = htmlExportPipeline('   ', TEST_THEME);
    expect(result.ok).toBe(false);
  });
});

describe('pdfPrintPipeline', () => {
  it('produces rendered HTML for valid markdown', () => {
    const result = pdfPrintPipeline('*italic*', TEST_THEME);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.target).toBe('pdf-print');
      expect(result.value.html).toContain('<em>italic</em>');
    }
  });

  it('fails for empty markdown', () => {
    const result = pdfPrintPipeline('', TEST_THEME);
    expect(result.ok).toBe(false);
  });
});
