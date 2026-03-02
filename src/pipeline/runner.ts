import type { Result } from '../core/errors';
import { ok } from '../core/errors';
import type { PipelineContext, PipelineOutput, PipelineStep } from './types';

/**
 * Runs an ordered list of pipeline steps, short-circuiting on the first error.
 * Returns `Result<PipelineOutput>` so callers never need try/catch.
 */
export function runPipeline(
  steps: readonly PipelineStep[],
  initialContext: PipelineContext,
  target: PipelineOutput['target'],
): Result<PipelineOutput> {
  let ctx: PipelineContext = initialContext;

  for (const step of steps) {
    const result = step.execute(ctx);
    if (!result.ok) {
      return result as Result<PipelineOutput>;
    }
    ctx = result.value;
  }

  return ok({ html: ctx.html ?? '', target });
}
