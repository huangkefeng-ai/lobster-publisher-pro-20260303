import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebouncedFunction } from './debounce';

describe('createDebouncedFunction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays callback until wait time passes', () => {
    const callback = vi.fn();
    const debounced = createDebouncedFunction(callback, 120);

    debounced('hello');
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(119);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledWith('hello');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('keeps only the latest call arguments during rapid updates', () => {
    const callback = vi.fn();
    const debounced = createDebouncedFunction(callback, 100);

    debounced('first');
    vi.advanceTimersByTime(50);
    debounced('second');
    vi.advanceTimersByTime(50);
    debounced('third');
    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('cancels pending callback', () => {
    const callback = vi.fn();
    const debounced = createDebouncedFunction(callback, 100);

    debounced('value');
    debounced.cancel();
    vi.advanceTimersByTime(100);

    expect(callback).not.toHaveBeenCalled();
  });
});
