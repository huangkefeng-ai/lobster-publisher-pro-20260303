import type { Result } from '../core/errors';
import type { ThemeDefinition } from '../theme/themeTypes';
import type { PipelineContext, PipelineOutput } from './types';
import { runPipeline } from './runner';
import { validateStep, renderStep, sanitizeWechatStep, inlineStyleStep } from './steps';

function buildContext(markdown: string, theme: ThemeDefinition): PipelineContext {
  return { markdown, theme };
}

/**
 * Full WeChat publish pipeline: validate → render → sanitize → inline-style.
 * Returns styled HTML ready for clipboard copy.
 */
export function wechatPipeline(markdown: string, theme: ThemeDefinition): Result<PipelineOutput> {
  return runPipeline(
    [validateStep, renderStep, sanitizeWechatStep, inlineStyleStep],
    buildContext(markdown, theme),
    'wechat',
  );
}

/**
 * HTML export pipeline: validate → render.
 * Returns raw rendered HTML (caller wraps in full document).
 */
export function htmlExportPipeline(markdown: string, theme: ThemeDefinition): Result<PipelineOutput> {
  return runPipeline(
    [validateStep, renderStep],
    buildContext(markdown, theme),
    'html-export',
  );
}

/**
 * PDF print pipeline: validate → render.
 * Returns raw rendered HTML (caller wraps in themed document and prints).
 */
export function pdfPrintPipeline(markdown: string, theme: ThemeDefinition): Result<PipelineOutput> {
  return runPipeline(
    [validateStep, renderStep],
    buildContext(markdown, theme),
    'pdf-print',
  );
}
