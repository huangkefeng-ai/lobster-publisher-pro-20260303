import { type Result, PublishErrorCode, ok, err } from './errors';

const MAX_MARKDOWN_BYTES = 512_000; // 500 KB

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates markdown input before entering the pipeline.
 * Returns `Result<string>` with the trimmed markdown on success.
 */
export function validateMarkdown(markdown: string): Result<string> {
  const trimmed = markdown.trim();

  if (trimmed.length === 0) {
    return err(PublishErrorCode.EMPTY_INPUT, 'Markdown content is empty.');
  }

  const byteLength = new TextEncoder().encode(trimmed).length;
  if (byteLength > MAX_MARKDOWN_BYTES) {
    return err(
      PublishErrorCode.VALIDATION_FAILED,
      `Markdown exceeds maximum size (${Math.round(byteLength / 1024)} KB > ${MAX_MARKDOWN_BYTES / 1024} KB).`,
    );
  }

  return ok(trimmed);
}

/**
 * Validates an image file before processing.
 * Pure check on type and size — no DOM dependency.
 */
export function validateImageFile(file: { type: string; size: number }): Result<void> {
  const normalizedType = file.type.trim().toLowerCase();

  if (!ALLOWED_IMAGE_TYPES.has(normalizedType)) {
    return err(
      PublishErrorCode.VALIDATION_FAILED,
      `Unsupported image type: ${file.type}. Allowed: ${[...ALLOWED_IMAGE_TYPES].join(', ')}.`,
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return err(
      PublishErrorCode.IMAGE_TOO_LARGE,
      `Image exceeds ${MAX_IMAGE_BYTES / (1024 * 1024)} MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    );
  }

  return ok(undefined);
}
