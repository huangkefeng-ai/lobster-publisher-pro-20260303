export interface DebouncedFunction<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel: () => void;
}

export function createDebouncedFunction<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number,
): DebouncedFunction<TArgs> {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: TArgs) => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      callback(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}
