import { Device, Connection, DeviceType } from '../types';

export const DEFAULT_MASK = '255.255.255.0';

/** Xây map kề (neighbor) từ danh sách kết nối, dùng cho BFS. */
export function buildNeighborMap(connections: Connection[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  connections.forEach(c => {
    if (!map.has(c.sourceId)) map.set(c.sourceId, []);
    if (!map.has(c.targetId)) map.set(c.targetId, []);
    map.get(c.sourceId)!.push(c.targetId);
    map.get(c.targetId)!.push(c.sourceId);
  });
  return map;
}

/** Tìm đường đi ngắn nhất (theo số cạnh) giữa 2 thiết bị. Trả về mảng id thiết bị theo thứ tự, hoặc null nếu không có đường đi. */
export function bfsPath(startId: string, endId: string, connections: Connection[]): string[] | null {
  if (startId === endId) return [startId];
  const neighbors = buildNeighborMap(connections);
  const queue: string[] = [startId];
  const visited = new Set<string>([startId]);
  const prev = new Map<string, string>();

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === endId) {
      const path = [curr];
      let p = curr;
      while (prev.has(p)) {
        p = prev.get(p)!;
        path.unshift(p);
      }
      return path;
    }
    for (const n of neighbors.get(curr) || []) {
      if (!visited.has(n)) {
        visited.add(n);
        prev.set(n, curr);
        queue.push(n);
      }
    }
  }
  return null;
}

/** Kiểm tra thiết bị bắt đầu có kết nối (trực tiếp/gián tiếp) tới một thiết bị thuộc loại `targetType` hay không. */
export function checkConnectionToType(
  startId: string,
  targetType: DeviceType,
  devices: Device[],
  connections: Connection[]
): boolean {
  const neighbors = buildNeighborMap(connections);
  const queue = [startId];
  const visited = new Set<string>([startId]);
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const dev = devices.find(d => d.id === curr);
    if (dev && dev.type === targetType) return true;
    for (const n of neighbors.get(curr) || []) {
      if (!visited.has(n)) { visited.add(n); queue.push(n); }
    }
  }
  return false;
}

/** Chuyển "a.b.c.d" thành số nguyên 32-bit, trả về null nếu không hợp lệ. */
export function ipToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const n = Number(p);
    if (n < 0 || n > 255) return null;
    result = (result << 8) + n;
  }
  return result >>> 0;
}

export function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

/**
 * Kiểm tra targetIp có cùng subnet với sourceIp hay không, xét theo subnet mask của SOURCE
 * (giống cách một máy thật quyết định "gửi thẳng" hay "gửi qua gateway").
 */
export function isSameSubnet(sourceIp: string, sourceMask: string | undefined, targetIp: string): boolean {
  const sIp = ipToInt(sourceIp);
  const sMask = ipToInt(sourceMask || DEFAULT_MASK);
  const tIp = ipToInt(targetIp);
  if (sIp === null || sMask === null || tIp === null) return false;
  return ((sIp & sMask) >>> 0) === ((tIp & sMask) >>> 0);
}

/** Địa chỉ mạng (network address) của 1 thiết bị, dùng làm "chữ ký" subnet để đếm số subnet phân biệt. */
export function networkAddressOf(device: Device): string | null {
  if (!device.ip) return null;
  const ipInt = ipToInt(device.ip);
  const maskInt = ipToInt(device.mask || DEFAULT_MASK);
  if (ipInt === null || maskInt === null) return null;
  return intToIp((ipInt & maskInt) >>> 0);
}

/** Đếm số subnet (dải mạng) phân biệt đang xuất hiện trong sơ đồ. */
export function countDistinctSubnets(devices: Device[]): number {
  const nets = new Set<string>();
  devices.forEach(d => {
    const net = networkAddressOf(d);
    if (net) nets.add(net);
  });
  return nets.size;
}

/** Kiểm tra một đường đi (mảng id thiết bị) có đi qua ít nhất 1 Router hay không. */
export function pathContainsRouter(path: string[], devices: Device[]): boolean {
  return path.some(id => devices.find(d => d.id === id)?.type === 'router');
}
