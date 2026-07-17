import React from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { ToastItem } from '../hooks/useToasts';

const ICONS: Record<ToastItem['type'], React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-green-600 shrink-0" />,
  error: <XCircle size={16} className="text-red-500 shrink-0" />,
  info: <Info size={16} className="text-blue-500 shrink-0" />,
};

const STYLES: Record<ToastItem['type'], string> = {
  success: 'border-green-300 bg-white',
  error: 'border-red-300 bg-white',
  info: 'border-slate-300 bg-white',
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="absolute bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none w-72">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto flex items-start gap-2 px-3 py-2.5 rounded-lg border shadow-xl text-[11px] font-semibold text-slate-700 cursor-pointer animate-in slide-in-from-bottom-2 fade-in duration-200 ${STYLES[t.type]}`}
        >
          {ICONS[t.type]}
          <span className="leading-snug">{t.text}</span>
        </div>
      ))}
    </div>
  );
};
