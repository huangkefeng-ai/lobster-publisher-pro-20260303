import { type Result, PublishErrorCode, ok, err } from '../core/errors';
import { validateMarkdown } from '../core/validator';
import { renderMarkdownToHtml } from '../core/renderer';
import { sanitizeWechatHtml } from '../wechat/sanitizer';
import { applyWechatInlineStyles } from '../wechat/inlineStyles';
import type { PipelineContext, PipelineStep } from './types';

/** Validates markdown input before rendering. */
export const validateStep: PipelineStep = {
  name: 'validate',
  execute(ctx: PipelineContext): Result<PipelineContext> {
    const result = validateMarkdown(ctx.markdown);
    if (!result.ok) {
      return result as Result<PipelineContext>;
    }
    return ok({ ...ctx, markdown: result.value });
  },
};

/** Renders markdown to raw HTML via marked + DOMPurify. */
export const renderStep: PipelineStep = {
  name: 'render',
  execute(ctx: PipelineContext): Result<PipelineContext> {
    try {
      const html = renderMarkdownToHtml(ctx.markdown);
      return ok({ ...ctx, html });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown render error';
      return err(PublishErrorCode.RENDER_FAILED, message);
    }
  },
};

/** Sanitizes HTML for WeChat compatibility (tag/attribute whitelist). */
export const sanitizeWechatStep: PipelineStep = {
  name: 'sanitize-wechat',
  execute(ctx: PipelineContext): Result<PipelineContext> {
    if (!ctx.html) {
      return err(PublishErrorCode.SANITIZE_FAILED, 'No HTML to sanitize (render step missing).');
    }
    try {
      const html = sanitizeWechatHtml(ctx.html);
      return ok({ ...ctx, html });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sanitize failed';
      return err(PublishErrorCode.SANITIZE_FAILED, message);
    }
  },
};

/** Applies theme-based inline styles for WeChat rendering. */
export const inlineStyleStep: PipelineStep = {
  name: 'inline-styles',
  execute(ctx: PipelineContext): Result<PipelineContext> {
    if (!ctx.html) {
      return err(PublishErrorCode.RENDER_FAILED, 'No HTML to style (render step missing).');
    }
    try {
      const styledHtml = applyWechatInlineStyles(ctx.html, ctx.theme);
      return ok({ ...ctx, styledHtml, html: styledHtml });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Inline style application failed';
      return err(PublishErrorCode.RENDER_FAILED, message);
    }
  },
};
