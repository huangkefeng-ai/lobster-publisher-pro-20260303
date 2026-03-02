import type { ThemeDefinition } from '../theme/themeTypes';
import type { Result } from '../core/errors';

/** Immutable context passed through each pipeline step. */
export interface PipelineContext {
  readonly markdown: string;
  readonly theme: ThemeDefinition;
  readonly html?: string;
  readonly styledHtml?: string;
}

/** Output produced at the end of a successful pipeline run. */
export interface PipelineOutput {
  /** The final HTML string (sanitized + styled for the target). */
  html: string;
  /** Which pipeline produced this output. */
  target: 'wechat' | 'html-export' | 'pdf-print';
}

/**
 * A single composable step in the publish pipeline.
 * Each step receives the current context and returns an updated context
 * wrapped in a `Result` so errors short-circuit without throwing.
 */
export interface PipelineStep {
  /** Human-readable name for logging / debugging. */
  readonly name: string;
  /** Execute the step. Must be a pure transform (no side effects). */
  execute(ctx: PipelineContext): Result<PipelineContext>;
}
