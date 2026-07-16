import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Device } from '../types';

interface DeleteConfirmModalProps {
  device: Device;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ device, onCancel, onConfirm }) => {
  return (
    <div className="absolute inset-0 bg-black/70 z-[110] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-red-500/30 overflow-hidden">
        <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-lg">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-red-700">Xác nhận xóa</h3>
            <p className="text-[10px] text-red-600 uppercase tracking-widest font-bold">Có thể hoàn tác bằng Ctrl+Z</p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-center">
          <p className="text-xs text-slate-700">
            Bạn có chắc chắn muốn xóa thiết bị <span className="text-slate-900 font-bold">{device.name}</span>?
            Mọi kết nối liên quan sẽ bị gỡ bỏ.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-900/40 transition-all active:scale-95"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
