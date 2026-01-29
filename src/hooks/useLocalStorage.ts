import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions {
  onError?: (error: Error, operation: 'read' | 'write') => void;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      options?.onError?.(error as Error, 'read');
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(value);
  }, []);

  useEffect(() => {
    try {
      const serialized = JSON.stringify(storedValue);
      const currentSize = new Blob([serialized]).size;

      // localStorageの容量警告（4MBを超えた場合）
      if (currentSize > 4 * 1024 * 1024) {
        options?.onError?.(
          new Error('データサイズが大きくなっています。古いタスクの削除を検討してください。'),
          'write'
        );
      }

      window.localStorage.setItem(key, serialized);
    } catch (error) {
      const err = error as Error;
      if (err.name === 'QuotaExceededError') {
        options?.onError?.(
          new Error('ストレージ容量が不足しています。古いタスクを削除してください。'),
          'write'
        );
      } else {
        options?.onError?.(err, 'write');
      }
    }
  }, [key, storedValue, options]);

  return [storedValue, setValue];
}
