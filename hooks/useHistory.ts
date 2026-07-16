import { useCallback, useState } from 'react';
import { Device, Connection } from '../types';

export interface NetworkSnapshot {
  devices: Device[];
  connections: Connection[];
}

const MAX_HISTORY = 50;

/**
 * Quản lý state của sơ đồ mạng (devices + connections) kèm khả năng Undo/Redo.
 *
 * Cách dùng:
 *  - Đọc `devices` / `connections` như state bình thường.
 *  - Gọi `setDevices` / `setConnections` để cập nhật (hỗ trợ cả giá trị trực tiếp
 *    lẫn updater function, giống useState).
 *  - Gọi `pushHistory()` NGAY TRƯỚC một thao tác "chốt" (thêm/xóa thiết bị, nối/xóa
 *    cáp, xóa toàn bộ lab...) để lưu lại điểm khôi phục. Không cần gọi khi chỉ đang
 *    kéo-thả liên tục (chỉ cần gọi 1 lần lúc bắt đầu kéo).
 */
export function useHistory(initialDevices: Device[] = [], initialConnections: Connection[] = []) {
  const [devices, setDevicesState] = useState<Device[]>(initialDevices);
  const [connections, setConnectionsState] = useState<Connection[]>(initialConnections);
  const [past, setPast] = useState<NetworkSnapshot[]>([]);
  const [future, setFuture] = useState<NetworkSnapshot[]>([]);

  const setDevices = useCallback((updater: Device[] | ((prev: Device[]) => Device[])) => {
    setDevicesState(updater as any);
  }, []);

  const setConnections = useCallback((updater: Connection[] | ((prev: Connection[]) => Connection[])) => {
    setConnectionsState(updater as any);
  }, []);

  // Chụp lại trạng thái hiện tại vào lịch sử trước khi thực hiện một thay đổi "chốt".
  const pushHistory = useCallback(() => {
    setPast(p => {
      const next = [...p, { devices, connections }];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
    setFuture([]);
  }, [devices, connections]);

  const undo = useCallback(() => {
    setPast(p => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      setFuture(f => [{ devices, connections }, ...f].slice(0, MAX_HISTORY));
      setDevicesState(previous.devices);
      setConnectionsState(previous.connections);
      return p.slice(0, -1);
    });
  }, [devices, connections]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const nextState = f[0];
      setPast(p => [...p, { devices, connections }].slice(-MAX_HISTORY));
      setDevicesState(nextState.devices);
      setConnectionsState(nextState.connections);
      return f.slice(1);
    });
  }, [devices, connections]);

  const resetHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    devices,
    connections,
    setDevices,
    setConnections,
    pushHistory,
    undo,
    redo,
    resetHistory,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
