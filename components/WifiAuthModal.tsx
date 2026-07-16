import React from 'react';
import { WifiHigh, Wifi, Key, ShieldCheck } from 'lucide-react';

interface WifiAuthModalProps {
  ssid: string;
  password: string;
  onChangeSsid: (value: string) => void;
  onChangePassword: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const WifiAuthModal: React.FC<WifiAuthModalProps> = ({
  ssid, password, onChangeSsid, onChangePassword, onCancel, onConfirm
}) => {
  return (
    <div className="absolute inset-0 bg-black/70 z-[100] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-300 overflow-hidden">
        <div className="bg-slate-100 p-4 border-b border-slate-300 flex items-center gap-3">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <WifiHigh size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Cấu hình Wifi</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Authentication Required</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1.5 uppercase tracking-widest">Tên mạng (SSID)</label>
            <div className="relative">
              <Wifi size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 outline-none transition-all"
                placeholder="Nhập tên Wifi..."
                value={ssid}
                onChange={(e) => onChangeSsid(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1.5 uppercase tracking-widest">Mật khẩu Wifi</label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 outline-none transition-all"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => onChangePassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={14} /> Kết nối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
