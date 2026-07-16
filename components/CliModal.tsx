import React from 'react';
import { Terminal, XCircle } from 'lucide-react';
import { Device, Log } from '../types';

interface CliModalProps {
  device: Device;
  logs: Log[];
  pingTargetIP: string;
  onChangePingTargetIP: (value: string) => void;
  onRunPing: () => void;
  onClose: () => void;
}

export const CliModal: React.FC<CliModalProps> = ({
  device, logs, pingTargetIP, onChangePingTargetIP, onRunPing, onClose
}) => {
  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-50 w-full max-w-2xl h-[500px] rounded-xl shadow-2xl border border-slate-300 flex flex-col font-mono overflow-hidden">
        <div className="bg-white p-3 border-b border-slate-200 flex justify-between items-center px-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-widest">
            <Terminal size={14} className="text-emerald-500" /> CLI: {device.name}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition-colors">
            <XCircle size={18} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto text-xs space-y-1 text-slate-700 scroll-smooth">
          <div className="text-slate-500 opacity-50 mb-4 italic">Cisco IOS Software, Version 15.2, Simulation Environment</div>
          {logs.map(log => (
            <div key={log.id} className={log.type === 'success' ? 'text-emerald-600' : log.type === 'error' ? 'text-red-600' : 'text-slate-700'}>
              <span className="text-slate-500 mr-2">[{new Date(log.id).toLocaleTimeString()}]</span>
              {log.text}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
            <span className="text-emerald-500 font-bold">{device.name}</span>
            <span className="text-slate-500">ping</span>
            <input
              autoFocus
              className="bg-transparent border-none focus:ring-0 text-slate-900 flex-1 p-0 outline-none"
              placeholder="192.168.1.1"
              value={pingTargetIP}
              onChange={(e) => onChangePingTargetIP(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onRunPing()}
            />
          </div>
        </div>
        <div className="p-2 bg-slate-100/70 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">Nhấn 'Enter' để thực hiện lệnh Ping</div>
      </div>
    </div>
  );
};
