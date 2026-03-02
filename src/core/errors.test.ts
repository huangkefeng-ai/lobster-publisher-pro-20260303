import { describe, expect, it } from 'vitest';
import { PublishError, PublishErrorCode, ok, err } from './errors';

describe('PublishErrorCode', () => {
  it('exposes all expected error codes as string constants', () => {
    expect(PublishErrorCode.EMPTY_INPUT).toBe('EMPTY_INPUT');
    expect(PublishErrorCode.RENDER_FAILED).toBe('RENDER_FAILED');
    expect(PublishErrorCode.SANITIZE_FAILED).toBe('SANITIZE_FAILED');
    expect(PublishErrorCode.CLIPBOARD_FAILED).toBe('CLIPBOARD_FAILED');
    expect(PublishErrorCode.EXPORT_FAILED).toBe('EXPORT_FAILED');
    expect(PublishErrorCode.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
    expect(PublishErrorCode.IMAGE_TOO_LARGE).toBe('IMAGE_TOO_LARGE');
  });
});

describe('PublishError', () => {
  it('is an instance of Error', () => {
    const error = new PublishError(PublishErrorCode.EMPTY_INPUT, 'empty');
    expect(error).toBeInstanceOf(Error);
  });

  it('sets name, code, and message correctly', () => {
    const error = new PublishError(PublishErrorCode.RENDER_FAILED, 'render broke');
    expect(error.name).toBe('PublishError');
    expect(error.code).toBe('RENDER_FAILED');
    expect(error.message).toBe('render broke');
  });

  it('serializes to JSON with name, code, and message', () => {
    const error = new PublishError(PublishErrorCode.CLIPBOARD_FAILED, 'no clipboard');
    const json = error.toJSON();
    expect(json).toEqual({
      name: 'PublishError',
      code: 'CLIPBOARD_FAILED',
      message: 'no clipboard',
    });
  });

  it('can be caught in a standard try/catch', () => {
    let caught: unknown;
    try {
      throw new PublishError(PublishErrorCode.EXPORT_FAILED, 'fail');
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(PublishError);
    expect((caught as PublishError).code).toBe('EXPORT_FAILED');
  });
});

describe('ok', () => {
  it('creates a success result with ok: true', () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it('works with string values', () => {
    const result = ok('hello');
    expect(result).toEqual({ ok: true, value: 'hello' });
  });

  it('works with undefined', () => {
    const result = ok(undefined);
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe('err', () => {
  it('creates a failure result with ok: false', () => {
    const result = err(PublishErrorCode.EMPTY_INPUT, 'nothing here');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(PublishError);
      expect(result.error.code).toBe('EMPTY_INPUT');
      expect(result.error.message).toBe('nothing here');
    }
  });

  it('the error in the result is a proper PublishError', () => {
    const result = err(PublishErrorCode.IMAGE_TOO_LARGE, 'too big');
    if (!result.ok) {
      expect(result.error.toJSON()).toEqual({
        name: 'PublishError',
        code: 'IMAGE_TOO_LARGE',
        message: 'too big',
      });
    }
  });
});
