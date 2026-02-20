import { useEffect } from 'react';

interface UseModalKeyboardOptions {
  onConfirm: () => void;
  onCancel: () => void;
  enabled?: boolean;
}

export function useModalKeyboard({ onConfirm, onCancel, enabled = true }: UseModalKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onConfirm();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onConfirm, onCancel, enabled]);
}
