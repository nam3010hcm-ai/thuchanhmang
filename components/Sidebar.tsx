import React from 'react';
import {
  Activity, Settings, Cable, Trash2, Monitor, Laptop, Smartphone, Tablet, Watch,
  Router as RouterIcon, Network, Wifi, Globe, Cloud, WifiHigh, Lock, Database,
  Terminal, Undo2, Redo2
} from 'lucide-react';
import { Device, DeviceType, Connection, ToolMode } from '../types';

interface SidebarProps {
  mode: ToolMode;
  setMode: (mode: ToolMode) => void;
  addDevice: (type: DeviceType) => void;
  currentSelected: Device | undefined;
  isInternetConnected: boolean;
  devices: Device[];
  connections: Connection[];
  onFieldFocus: () => void;
  onUpdateSelectedDevice: (patch: Partial<Device>) => void;
  onOpenCli: () => void;
  onResetLab: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mode, setMode, addDevice, currentSelected, isInternetConnected, devices, connections,
  onFieldFocus, onUpdateSelectedDevice, onOpenCli, onResetLab, undo, redo, canUndo, canRedo
}) => {
  return (
    <aside className="w-72 bg-slate-100 border-r border-slate-300 flex flex-col z-20 shadow-xl overflow-y-auto shrink-0">
      <div className="p-4 border-b border-slate-300 bg-slate-100/70 sticky top-0 z-10 backdrop-blur">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-400 w-5 h-5" />
            <h1 className="font-bold text-lg tracking-tight uppercase">THỰC HÀNH MẠNG ẢO</h1>
          </div>
          <div className="pl-7 -mt-0.5">
            <p className="text-[10px] text-slate-500 font-semibold leading-tight">Thiết kế bởi Trần Phương Nam</p>
            <p className="text-[9px] text-slate-500 font-medium">Trường Sĩ quan Công binh</p>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-lg gap-1 border border-slate-300">
          <button onClick={() => setMode(ToolMode.MOVE)} className={`flex-1 p-2 rounded flex justify-center ${mode === ToolMode.MOVE ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'}`} title="Di chuyển"><Settings size={18} /></button>
          <button onClick={() => setMode(ToolMode.CABLE)} className={`flex-1 p-2 rounded flex justify-center ${mode === ToolMode.CABLE ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'}`} title="Nối cáp"><Cable size={18} /></button>
          <button onClick={() => setMode(ToolMode.DELETE)} className={`flex-1 p-2 rounded flex justify-center ${mode === ToolMode.DELETE ? 'bg-red-600 text-white' : 'hover:bg-slate-200'}`} title="Xóa"><Trash2 size={18} /></button>
        </div>

        <div className="flex gap-1 mt-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl+Z)"
            className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 text-[10px] font-bold border border-slate-300 transition-all ${canUndo ? 'bg-white hover:bg-slate-200 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Undo2 size={13} /> Hoàn tác
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Làm lại (Ctrl+Y)"
            className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 text-[10px] font-bold border border-slate-300 transition-all ${canRedo ? 'bg-white hover:bg-slate-200 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Redo2 size={13} /> Làm lại
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Máy trạm (Wired)</h2>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addDevice('pc')} className="flex flex-col items-center p-2 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <Monitor size={24} className="text-emerald-400 mb-1" />
              <span className="text-[10px]">Desktop PC</span>
            </button>
            <button onClick={() => addDevice('laptop')} className="flex flex-col items-center p-2 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <Laptop size={24} className="text-emerald-400 mb-1" />
              <span className="text-[10px]">Laptop</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Thiết bị di động</h2>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => addDevice('mobile')} className="flex flex-col items-center p-2 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <Smartphone size={20} className="text-pink-400 mb-1" />
              <span className="text-[10px]">Phone</span>
            </button>
            <button onClick={() => addDevice('tablet')} className="flex flex-col items-center p-2 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <Tablet size={20} className="text-pink-400 mb-1" />
              <span className="text-[10px]">iPad</span>
            </button>
            <button onClick={() => addDevice('watch')} className="flex flex-col items-center p-2 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <Watch size={20} className="text-pink-400 mb-1" />
              <span className="text-[10px]">Watch</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Hạ tầng mạng</h2>
          <div className="space-y-2">
            <button onClick={() => addDevice('router')} className="w-full flex items-center gap-3 p-3 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <div className="bg-white p-2 rounded"><RouterIcon size={20} className="text-purple-400" /></div>
              <div className="text-left font-bold text-xs">Router Cisco</div>
            </button>
            <button onClick={() => addDevice('switch')} className="w-full flex items-center gap-3 p-3 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <div className="bg-white p-2 rounded"><Network size={20} className="text-blue-400" /></div>
              <div className="text-left font-bold text-xs">Switch 24-Port</div>
            </button>
            <button onClick={() => addDevice('access_point')} className="w-full flex items-center gap-3 p-3 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <div className="bg-white p-2 rounded"><Wifi size={20} className="text-purple-300" /></div>
              <div className="text-left font-bold text-xs">Access Point</div>
            </button>
            <button onClick={() => addDevice('modem')} className="w-full flex items-center gap-3 p-3 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <div className="bg-white p-2 rounded"><Globe size={20} className="text-amber-400" /></div>
              <div className="text-left font-bold text-xs">Modem (DSL/Cable)</div>
            </button>
            <button onClick={() => addDevice('isp')} className="w-full flex items-center gap-3 p-3 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
              <div className="bg-white p-2 rounded"><Cloud size={20} className="text-sky-400" /></div>
              <div className="text-left font-bold text-xs">Internet (ISP)</div>
            </button>
          </div>
        </section>

        {currentSelected && (
          <section className="bg-white p-4 rounded-xl border border-slate-300 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-[10px] font-bold text-blue-600 uppercase mb-3 flex items-center gap-2">
              <Settings size={12}/> Thuộc tính: {currentSelected.name}
            </h2>
            <div className="space-y-3">
              {['router', 'switch', 'access_point', 'modem'].includes(currentSelected.type) && (
                <div className="bg-slate-100/70 p-2 rounded-lg border border-slate-200 flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className={isInternetConnected ? 'text-green-400' : 'text-slate-500'} />
                    <span className="text-[10px] font-bold text-slate-700">INTERNET</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isInternetConnected ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                    {isInternetConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              )}

              {currentSelected.ip !== undefined && (
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase tracking-tight">ĐỊA CHỈ IP</label>
                  <input
                    className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs font-mono text-blue-700 focus:border-blue-500 outline-none"
                    value={currentSelected.ip}
                    onFocus={onFieldFocus}
                    onChange={(e) => onUpdateSelectedDevice({ ip: e.target.value })}
                  />
                </div>
              )}

              {currentSelected.type === 'access_point' && (
                <div className="pt-1 space-y-3">
                  <div>
                    <label className="flex items-center gap-1 text-[9px] text-slate-500 font-bold mb-1 uppercase tracking-tight">
                      <WifiHigh size={10} /> TÊN TRUY CẬP (SSID)
                    </label>
                    <input
                      className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs text-blue-700 focus:border-blue-500 outline-none"
                      value={currentSelected.ssid || ''}
                      onFocus={onFieldFocus}
                      onChange={(e) => onUpdateSelectedDevice({ ssid: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-[9px] text-slate-500 font-bold mb-1 uppercase tracking-tight">
                      <Lock size={10} /> MẬT KHẨU TRUY CẬP
                    </label>
                    <input
                      type="password"
                      className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs text-blue-700 focus:border-blue-500 outline-none"
                      value={currentSelected.password || ''}
                      placeholder="Để trống nếu không bảo mật"
                      onFocus={onFieldFocus}
                      onChange={(e) => onUpdateSelectedDevice({ password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {currentSelected.type === 'switch' && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mb-1">
                    <Database size={12} className="text-blue-400" /> BẢNG ĐỊA CHỈ MAC (CAM)
                  </div>
                  <div className="bg-slate-50 rounded border border-slate-300 overflow-hidden max-h-40 overflow-y-auto shadow-inner">
                    <table className="w-full text-[9px] font-mono">
                      <thead className="bg-slate-100 text-slate-500 sticky top-0 border-b border-slate-300">
                        <tr>
                          <th className="p-1.5 text-left pl-2">Port</th>
                          <th className="p-1.5 text-left">MAC</th>
                          <th className="p-1.5 text-left">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {connections.filter(c => c.sourceId === currentSelected.id || c.targetId === currentSelected.id).length > 0 ? (
                          connections.filter(c => c.sourceId === currentSelected.id || c.targetId === currentSelected.id).map((c, i) => {
                            const otherId = c.sourceId === currentSelected.id ? c.targetId : c.sourceId;
                            const dev = devices.find(d => d.id === otherId);
                            return dev ? (
                              <tr key={i} className="border-t border-slate-300 hover:bg-slate-100/70 transition-colors">
                                <td className="p-1.5 pl-2 text-blue-600 font-bold">Fa0/{i+1}</td>
                                <td className="p-1.5 text-slate-700">{dev.mac}</td>
                                <td className="p-1.5 text-slate-500 italic">Dynamic</td>
                              </tr>
                            ) : null;
                          })
                        ) : (
                          <tr><td colSpan={3} className="p-4 text-center text-slate-500 italic">Trống</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase tracking-tight">VẬT LÝ (MAC)</label>
                <div className="bg-slate-100 p-2 rounded text-[10px] font-mono text-yellow-700">{currentSelected.mac}</div>
              </div>

              {['pc', 'laptop', 'router'].includes(currentSelected.type) && (
                <button onClick={onOpenCli} className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg">
                  <Terminal size={12} /> Giao diện CLI
                </button>
              )}
            </div>
          </section>
        )}

        <div className="pt-4 border-t border-slate-300">
          <button onClick={onResetLab} className="w-full py-2 bg-red-50 hover:bg-red-100 border border-red-300 rounded text-[10px] font-bold uppercase tracking-wider text-red-600 transition-all active:scale-95">Làm mới phòng Lab</button>
        </div>
      </div>
    </aside>
  );
};
