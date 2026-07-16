import { useEffect, useRef } from 'react';
import { Device, Connection } from '../types';

const STORAGE_KEY = 'netlab-pro-state-v1';
const SAVE_DEBOUNCE_MS = 800;

interface PersistedState {
  devices: Device[];
  connections: Connection[];
}

/** Đọc sơ đồ đã lưu (nếu có) từ localStorage. An toàn khi chạy SSR/không có localStorage. */
export function loadPersistedLab(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.devices) && Array.isArray(parsed?.connections)) {
      return { devices: parsed.devices, connections: parsed.connections };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPersistedLab() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Tự động lưu devices/connections vào localStorage mỗi khi thay đổi (debounce),
 * để không mất dữ liệu khi refresh/đóng trình duyệt giữa buổi thực hành.
 */
export function useLabAutoSave(devices: Device[], connections: Connection[]) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Bỏ qua lần render đầu tiên (lúc mount, dữ liệu vừa được khôi phục hoặc còn rỗng)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ devices, connections }));
      } catch {
        // localStorage đầy hoặc bị chặn — bỏ qua, không làm gián đoạn trải nghiệm
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [devices, connections]);
}
