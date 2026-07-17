import { useCallback, useRef, useState } from 'react';

export interface ToastItem {
  id: number;
  text: string;
  type: 'info' | 'success' | 'error';
}

const AUTO_DISMISS_MS = 3500;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const notify = useCallback((text: string, type: ToastItem['type'] = 'info') => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  }, [dismiss]);

  return { toasts, notify, dismiss };
}
