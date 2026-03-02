/** Error codes for machine-readable pipeline error identification. */
export const PublishErrorCode = {
  EMPTY_INPUT: 'EMPTY_INPUT',
  RENDER_FAILED: 'RENDER_FAILED',
  SANITIZE_FAILED: 'SANITIZE_FAILED',
  CLIPBOARD_FAILED: 'CLIPBOARD_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  IMAGE_TOO_LARGE: 'IMAGE_TOO_LARGE',
} as const;

export type PublishErrorCode = (typeof PublishErrorCode)[keyof typeof PublishErrorCode];

/**
 * Structured error for the publish pipeline.
 * Extends `Error` so it works with standard catch blocks,
 * but carries a machine-readable `code` for programmatic handling.
 */
export class PublishError extends Error {
  readonly code: PublishErrorCode;

  constructor(code: PublishErrorCode, message: string) {
    super(message);
    this.name = 'PublishError';
    this.code = code;
  }

  /** Serialisation-safe representation for logging / telemetry. */
  toJSON(): { name: string; code: PublishErrorCode; message: string } {
    return { name: this.name, code: this.code, message: this.message };
  }
}

/** Discriminated union for pipeline-safe error propagation. */
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: PublishError };

/** Helper to create a success result. */
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

/** Helper to create a failure result. */
export function err<T>(code: PublishErrorCode, message: string): Result<T> {
  return { ok: false, error: new PublishError(code, message) };
}
