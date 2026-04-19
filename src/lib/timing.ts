import React from 'react';

/**
 * Debounce utility - delays function execution until after a period of inactivity
 * Useful for: note updates, search, resize handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Throttle utility - limits function execution to once per time period
 * Useful for: confetti, scroll events, rapid button clicks
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCallTime >= limitMs) {
      func(...args);
      lastCallTime = now;
    }
  };
}

/**
 * Debounce hook for React - returns a stable function reference
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number,
  dependencies: React.DependencyList
) {
  const debouncedRef = React.useRef<ReturnType<typeof debounce>>(
    debounce(callback, delayMs)
  );

  React.useEffect(() => {
    debouncedRef.current = debounce(callback, delayMs);
  }, [callback, delayMs, ...dependencies]);

  return debouncedRef.current;
}

/**
 * Throttle hook for React - returns a stable function reference
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limitMs: number,
  dependencies: React.DependencyList
) {
  const throttledRef = React.useRef<ReturnType<typeof throttle>>(
    throttle(callback, limitMs)
  );

  React.useEffect(() => {
    throttledRef.current = throttle(callback, limitMs);
  }, [callback, limitMs, ...dependencies]);

  return throttledRef.current;
}
