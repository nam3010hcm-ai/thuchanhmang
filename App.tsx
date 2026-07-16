
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Camera } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Device, DeviceType, Connection, Log, ToolMode } from './types';
import { generateMac, isWirelessClient } from './utils/networkHelpers';
import { useHistory } from './hooks/useHistory';
import { loadPersistedLab, clearPersistedLab, useLabAutoSave } from './hooks/useLabPersistence';
import { Sidebar } from './components/Sidebar';
import { DeviceNode } from './components/DeviceNode';
import { CliModal } from './components/CliModal';
import { WifiAuthModal } from './components/WifiAuthModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export default function NetworkLab() {
  // --- State: sơ đồ mạng (devices/connections) kèm Undo/Redo ---
  const {
    devices, connections, setDevices, setConnections,
    pushHistory, undo, redo, resetHistory, canUndo, canRedo
  } = useHistory([], []);

  const [draggedDevice, setDraggedDevice] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<ToolMode>(ToolMode.MOVE);
  const [cableStart, setCableStart] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [pingTargetIP, setPingTargetIP] = useState('');
  const [zoom, setZoom] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasRestored, setHasRestored] = useState(false);

  // Wifi Auth States
  const [wifiAuthModal, setWifiAuthModal] = useState<{
    isOpen: boolean;
    sourceId: string;
    targetId: string;
    apId: string;
    ssid: string;
    password: string;
  }>({ isOpen: false, sourceId: '', targetId: '', apId: '', ssid: '', password: '' });

  // Delete Confirmation State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    deviceId: string | null;
  }>({ isOpen: false, deviceId: null });

  const workspaceRef = useRef<HTMLDivElement>(null);

  // --- Actions ---
  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev.slice(-10), { id: Date.now(), text, type }]);
  };

  // --- Khôi phục sơ đồ đã lưu (localStorage) khi mở trang ---
  useEffect(() => {
    const saved = loadPersistedLab();
    if (saved && (saved.devices.length > 0 || saved.connections.length > 0)) {
      setDevices(saved.devices);
      setConnections(saved.connections);
      addLog('Đã khôi phục sơ đồ từ phiên làm việc trước.', 'info');
    }
    setHasRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Tự động lưu sơ đồ (debounce) mỗi khi devices/connections thay đổi ---
  useLabAutoSave(devices, connections);

  const addDevice = (type: DeviceType) => {
    const id = Date.now().toString();
    const count = devices.filter(d => d.type === type).length + 1;
    let name = '';
    let ports = 0;
    let ip = undefined;
    let ssid = undefined;
    let password = undefined;

    switch(type) {
      case 'pc': name = `PC-${count}`; ports = 1; ip = `192.168.1.${10 + count}`; break;
      case 'laptop': name = `Laptop-${count}`; ports = 1; ip = `192.168.1.${50 + count}`; break;
      case 'mobile': name = `Phone-${count}`; ports = 0; ip = `192.168.1.${100 + count}`; break;
      case 'tablet': name = `iPad-${count}`; ports = 0; ip = `192.168.1.${110 + count}`; break;
      case 'watch': name = `Watch-${count}`; ports = 0; ip = `192.168.1.${120 + count}`; break;
      case 'switch': name = `Switch-${count}`; ports = 24; break;
      case 'router': name = `Router-${count}`; ports = 4; ip = '192.168.1.1'; break;
      case 'access_point':
        name = `AP-${count}`;
        ports = 1;
        ssid = `NetLab_WiFi_${count}`;
        password = 'admin';
        break;
      case 'modem': name = `Modem-${count}`; ports = 2; break;
      case 'isp': name = `ISP`; ports = 99; ip = '8.8.8.8'; break;
    }

    const newDevice: Device = {
      id, type, name, ports, ip, mac: generateMac(),
      x: type === 'isp' ? 800 : 300 + Math.random() * 200,
      y: type === 'isp' ? 100 : 150 + Math.random() * 200,
      ssid,
      password
    };

    pushHistory();
    setDevices(prev => [...prev, newDevice]);
    addLog(`Đã thêm ${newDevice.name}`, 'info');
  };

  const finalizeConnection = (sourceId: string, targetId: string) => {
    const newConn: Connection = { id: `${sourceId}-${targetId}-${Date.now()}`, sourceId, targetId };
    pushHistory();
    setConnections(prev => [...prev, newConn]);
    setCableStart(null);
  };

  const finalizeDeleteDevice = () => {
    const id = deleteConfirmModal.deviceId;
    if (!id) return;

    pushHistory();
    setDevices(prev => prev.filter(d => d.id !== id));
    setConnections(prev => prev.filter(c => c.sourceId !== id && c.targetId !== id));
    if (selectedDevice === id) setSelectedDevice(null);
    addLog('Đã xóa thiết bị', 'error');
    setDeleteConfirmModal({ isOpen: false, deviceId: null });
  };

  const getWiredConnectionCount = useCallback((deviceId: string) => {
    return connections.filter(c => {
      if (c.sourceId !== deviceId && c.targetId !== deviceId) return false;
      const s = devices.find(d => d.id === c.sourceId);
      const t = devices.find(d => d.id === c.targetId);
      if (!s || !t) return false;
      return !isWirelessClient(s.type) && !isWirelessClient(t.type);
    }).length;
  }, [connections, devices]);

  const handleDeviceDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (mode === ToolMode.DELETE) {
      setDeleteConfirmModal({ isOpen: true, deviceId: id });
      return;
    }

    if (mode === ToolMode.CABLE) {
      if (cableStart === null) {
        setCableStart(id);
        addLog('Chọn thiết bị đích...', 'info');
      } else {
        if (cableStart === id) {
          setCableStart(null);
          return;
        }

        const sourceDev = devices.find(d => d.id === cableStart);
        const targetDev = devices.find(d => d.id === id);
        if (!sourceDev || !targetDev) return;

        const isSourceWireless = isWirelessClient(sourceDev.type);
        const isTargetWireless = isWirelessClient(targetDev.type);
        const hasAPInvolved = sourceDev.type === 'access_point' || targetDev.type === 'access_point';
        const apDevice = sourceDev.type === 'access_point' ? sourceDev : (targetDev.type === 'access_point' ? targetDev : null);

        if (isSourceWireless || isTargetWireless) {
          if (!hasAPInvolved) {
            addLog('Thiết bị di động chỉ có thể kết nối không dây với Access Point!', 'error');
            setCableStart(null);
            return;
          }
          setWifiAuthModal({
            isOpen: true,
            sourceId: cableStart,
            targetId: id,
            apId: apDevice!.id,
            ssid: '',
            password: ''
          });
          return;
        } else {
          const sourceWiredCount = getWiredConnectionCount(cableStart);
          const targetWiredCount = getWiredConnectionCount(id);

          if (sourceDev.ports !== 99 && sourceWiredCount >= sourceDev.ports) {
            addLog(`${sourceDev.name} đã hết cổng LAN vật lý!`, 'error');
            setCableStart(null);
            return;
          }
          if (targetDev.ports !== 99 && targetWiredCount >= targetDev.ports) {
            addLog(`${targetDev.name} đã hết cổng LAN vật lý!`, 'error');
            setCableStart(null);
            return;
          }
        }

        finalizeConnection(cableStart, id);
        addLog('Cắm dây mạng thành công!', 'success');
      }
      return;
    }

    if (mode === ToolMode.MOVE) {
      // Chụp lại lịch sử MỘT LẦN lúc bắt đầu kéo, không phải trên từng pixel di chuyển
      pushHistory();
      setDraggedDevice(id);
      setSelectedDevice(id);
      const dev = devices.find(d => d.id === id);
      if (dev && workspaceRef.current) {
        const rect = workspaceRef.current.getBoundingClientRect();
        setOffset({ x: (e.clientX - rect.left) / zoom - dev.x, y: (e.clientY - rect.top) / zoom - dev.y });
      }
    }
  };

  const handleWifiAuth = () => {
    const ap = devices.find(d => d.id === wifiAuthModal.apId);
    if (!ap) return;

    if (wifiAuthModal.ssid === ap.ssid && wifiAuthModal.password === ap.password) {
      finalizeConnection(wifiAuthModal.sourceId, wifiAuthModal.targetId);
      addLog(`Connected: Đã kết nối thành công tới ${ap.name}`, 'success');
      setWifiAuthModal({ ...wifiAuthModal, isOpen: false });
    } else {
      addLog('Lỗi: SSID hoặc Mật khẩu Wifi không chính xác!', 'error');
    }
  };

  const handleDeleteConnection = (e: React.MouseEvent, connectionId: string) => {
    if (mode === ToolMode.DELETE) {
      e.stopPropagation();
      pushHistory();
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      addLog('Đã xóa cáp nối', 'error');
    }
  };

  const handleWorkspacePointerMove = (e: React.PointerEvent) => {
    if (draggedDevice && mode === ToolMode.MOVE && workspaceRef.current) {
      const rect = workspaceRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - offset.x;
      const y = (e.clientY - rect.top) / zoom - offset.y;
      setDevices(prev => prev.map(d => d.id === draggedDevice ? { ...d, x, y } : d));
    }
  };

  const handleWorkspacePointerUp = () => setDraggedDevice(null);

  const checkConnectionToType = (startId: string, targetType: DeviceType) => {
    const queue = [startId];
    const visited = new Set<string>();
    visited.add(startId);
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentDev = devices.find(d => d.id === currentId);
      if (currentDev && currentDev.type === targetType) return true;
      const neighbors = connections
        .filter(c => c.sourceId === currentId || c.targetId === currentId)
        .map(c => c.sourceId === currentId ? c.targetId : c.sourceId);
      for (const nid of neighbors) {
        if (!visited.has(nid)) { visited.add(nid); queue.push(nid); }
      }
    }
    return false;
  };

  const runPing = () => {
    if (!selectedDevice) return;
    const source = devices.find(d => d.id === selectedDevice);
    if (!source) return;
    const target = devices.find(d => d.ip === pingTargetIP);
    addLog(`Pinging ${pingTargetIP} from ${source.name}...`, 'info');

    if (!target) {
      const canReachISP = checkConnectionToType(source.id, 'isp');
      if (canReachISP && pingTargetIP !== '127.0.0.1') {
        setTimeout(() => addLog(`Reply from ${pingTargetIP}: bytes=32 time=45ms (via Internet)`, 'success'), 800);
      } else {
        setTimeout(() => addLog(`Request timed out. (IP không tồn tại)`, 'error'), 1000);
      }
      return;
    }

    if (source.id === target.id) {
      setTimeout(() => addLog(`Reply from ${target.ip}: loopback <1ms`, 'success'), 300);
      return;
    }

    const queue = [source.id];
    const visited = new Set<string>();
    visited.add(source.id);
    let found = false;
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === target.id) { found = true; break; }
      connections
        .filter(c => c.sourceId === curr || c.targetId === curr)
        .map(c => c.sourceId === curr ? c.targetId : c.sourceId)
        .forEach(nid => { if (!visited.has(nid)) { visited.add(nid); queue.push(nid); } });
    }

    setTimeout(() => {
      if (found) addLog(`Reply from ${target.ip}: bytes=32 time=12ms TTL=64`, 'success');
      else addLog(`Destination host unreachable. (No path)`, 'error');
    }, 1000);
  };

  const saveAsImage = async () => {
    if (!workspaceRef.current) return;
    setIsCapturing(true);
    addLog('Đang chuẩn bị ảnh sơ đồ...', 'info');

    try {
      const dataUrl = await toPng(workspaceRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff', // matches light theme background
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      const link = document.createElement('a');
      link.download = `NetLab_Result_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      addLog('Đã lưu ảnh sơ đồ thành công!', 'success');
    } catch (err) {
      console.error(err);
      addLog('Lỗi khi xuất ảnh sơ đồ.', 'error');
    } finally {
      setIsCapturing(false);
    }
  };

  const resetLab = () => {
    pushHistory();
    setDevices([]);
    setConnections([]);
    clearPersistedLab();
    resetHistory();
    addLog('Đã làm mới phòng lab', 'info');
  };

  const updateSelectedDevice = (patch: Partial<Device>) => {
    if (!selectedDevice) return;
    setDevices(prev => prev.map(d => d.id === selectedDevice ? { ...d, ...patch } : d));
  };

  // --- Phím tắt: Ctrl+Z / Ctrl+Y (undo-redo), Delete (xóa thiết bị đang chọn), Esc (hủy) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = !!target && ['INPUT', 'TEXTAREA'].includes(target.tagName);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      if (isTyping) return;

      if (e.key === 'Escape') {
        setCableStart(null);
        setWifiAuthModal(w => ({ ...w, isOpen: false }));
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedDevice) {
        setDeleteConfirmModal({ isOpen: true, deviceId: selectedDevice });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedDevice]);

  const renderCables = () => {
    return connections.map(conn => {
      const src = devices.find(d => d.id === conn.sourceId);
      const tgt = devices.find(d => d.id === conn.targetId);
      if (!src || !tgt) return null;

      const getCenter = (d: Device) => {
        if (d.type === 'switch') return { x: d.x + 64, y: d.y + 24 };
        if (d.type === 'isp') return { x: d.x + 40, y: d.y + 40 };
        return { x: d.x + 32, y: d.y + 32 };
      };

      const p1 = getCenter(src);
      const p2 = getCenter(tgt);

      const isWan = src.type === 'isp' || tgt.type === 'isp' || src.type === 'modem' || tgt.type === 'modem';
      const isWireless = isWirelessClient(src.type) || isWirelessClient(tgt.type);

      let stroke = "#3b82f6";
      let dash = "";
      if (isWan) stroke = "#f59e0b";
      if (isWireless) { stroke = "#a855f7"; dash = "4,4"; }

      return (
        <g
          key={conn.id}
          className={`${mode === ToolMode.DELETE ? 'cursor-pointer' : ''}`}
          onClick={(e) => handleDeleteConnection(e, conn.id)}
        >
          <line
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke="transparent"
            strokeWidth="15"
            className="pointer-events-auto"
          />
          <line
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={stroke}
            strokeWidth="3"
            strokeDasharray={dash}
            className={`opacity-70 transition-colors pointer-events-none ${mode === ToolMode.DELETE ? 'hover:stroke-red-500' : ''}`}
          />
          {isWireless && (
            <circle cx={(p1.x + p2.x)/2} cy={(p1.y + p2.y)/2} r="4" fill="#a855f7" className="animate-ping opacity-50" />
          )}
        </g>
      );
    });
  };

  const currentSelected = devices.find(d => d.id === selectedDevice);
  const isInternetConnected = currentSelected ? checkConnectionToType(currentSelected.id, 'isp') : false;
  const deviceToDelete = devices.find(d => d.id === deleteConfirmModal.deviceId);

  if (!hasRestored) return null;

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">
      <Sidebar
        mode={mode}
        setMode={setMode}
        addDevice={addDevice}
        currentSelected={currentSelected}
        isInternetConnected={isInternetConnected}
        devices={devices}
        connections={connections}
        onFieldFocus={pushHistory}
        onUpdateSelectedDevice={updateSelectedDevice}
        onOpenCli={() => { setIsPingModalOpen(true); setLogs([]); }}
        onResetLab={resetLab}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-white">
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-slate-300 text-[10px] font-bold text-slate-500 flex items-center gap-4 pointer-events-auto shadow-2xl">
             <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${mode === ToolMode.MOVE ? 'bg-blue-400' : mode === ToolMode.CABLE ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                CHẾ ĐỘ: {mode.toUpperCase()}
             </div>
             <div className="w-px h-3 bg-slate-200"></div>
             <div>{devices.length} THIẾT BỊ | {connections.length} KẾT NỐI</div>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={saveAsImage}
              disabled={isCapturing}
              className={`p-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 shadow-xl transition-all active:scale-90 flex items-center gap-2 text-xs font-bold ${isCapturing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Camera size={16} className={isCapturing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">LƯU ẢNH SƠ ĐỒ</span>
            </button>
            <div className="w-px h-full bg-slate-200 mx-1"></div>
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 shadow-xl transition-all active:scale-90"><ZoomOut size={16}/></button>
            <div className="bg-slate-100 px-3 flex items-center text-xs font-bold rounded-lg border border-slate-300 shadow-xl">{Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 shadow-xl transition-all active:scale-90"><ZoomIn size={16}/></button>
          </div>
        </div>

        <div
          ref={workspaceRef}
          className="flex-1 overflow-auto cursor-crosshair canvas-grid relative"
          style={{ touchAction: mode === ToolMode.MOVE ? 'none' : 'auto' }}
          onPointerMove={handleWorkspacePointerMove}
          onPointerUp={handleWorkspacePointerUp}
          onPointerLeave={handleWorkspacePointerUp}
        >
          <div style={{ transform: `scale(${zoom})`, transformOrigin: '0 0', width: '200%', height: '200%' }}>
            <svg className="absolute top-0 left-0 w-full h-full">
              {renderCables()}
              {cableStart && (
                <line
                  x1={devices.find(d => d.id === cableStart)!.x + 32}
                  y1={devices.find(d => d.id === cableStart)!.y + 32}
                  x2={0} y2={0}
                  stroke="#60a5fa" strokeWidth="2" strokeDasharray="4,4" className="opacity-50 pointer-events-none"
                />
              )}
            </svg>

            {devices.map(device => (
              <DeviceNode
                key={device.id}
                device={device}
                isActive={connections.some(c => c.sourceId === device.id || c.targetId === device.id)}
                isSelected={selectedDevice === device.id}
                isCableStart={cableStart === device.id}
                isDragging={draggedDevice === device.id}
                wiredPortCount={getWiredConnectionCount(device.id)}
                onPointerDown={handleDeviceDown}
              />
            ))}
          </div>
        </div>

        {deleteConfirmModal.isOpen && deviceToDelete && (
          <DeleteConfirmModal
            device={deviceToDelete}
            onCancel={() => setDeleteConfirmModal({ isOpen: false, deviceId: null })}
            onConfirm={finalizeDeleteDevice}
          />
        )}

        {wifiAuthModal.isOpen && (
          <WifiAuthModal
            ssid={wifiAuthModal.ssid}
            password={wifiAuthModal.password}
            onChangeSsid={(ssid) => setWifiAuthModal(w => ({ ...w, ssid }))}
            onChangePassword={(password) => setWifiAuthModal(w => ({ ...w, password }))}
            onCancel={() => { setWifiAuthModal(w => ({ ...w, isOpen: false })); setCableStart(null); }}
            onConfirm={handleWifiAuth}
          />
        )}

        {isPingModalOpen && currentSelected && (
          <CliModal
            device={currentSelected}
            logs={logs}
            pingTargetIP={pingTargetIP}
            onChangePingTargetIP={setPingTargetIP}
            onRunPing={runPing}
            onClose={() => setIsPingModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
