import { Device, Connection } from '../types';
import { bfsPath, ipToInt, intToIp, DEFAULT_MASK } from './networkAnalysis';

/** Tìm Router gần nhất (có đường đi) mà đang bật DHCP và có cấu hình IP hợp lệ. */
export function findReachableDhcpRouter(clientId: string, devices: Device[], connections: Connection[]): Device | null {
  const routers = devices.filter(d => d.type === 'router' && d.dhcpServerEnabled && d.ip);
  for (const router of routers) {
    if (router.id === clientId) continue;
    if (bfsPath(clientId, router.id, connections)) return router;
  }
  return null;
}

const MAX_DHCP_SCAN = 1000;

/** Cấp một IP còn trống trong subnet của router (mô phỏng DHCP), giữ nguyên mask của router. */
export function assignDhcpIp(router: Device, devices: Device[]): { ip: string; mask: string } | null {
  const mask = router.mask || DEFAULT_MASK;
  const maskInt = ipToInt(mask);
  const routerIpInt = ipToInt(router.ip || '');
  if (maskInt === null || routerIpInt === null) return null;

  const network = (routerIpInt & maskInt) >>> 0;
  const hostMask = (~maskInt) >>> 0;
  const usedIps = new Set(devices.map(d => d.ip).filter((ip): ip is string => !!ip));

  const maxHost = Math.min(hostMask, MAX_DHCP_SCAN);
  for (let host = 2; host < maxHost; host++) {
    const candidateInt = (network | host) >>> 0;
    const candidateIp = intToIp(candidateInt);
    if (candidateIp === router.ip) continue;
    if (!usedIps.has(candidateIp)) {
      return { ip: candidateIp, mask };
    }
  }
  return null;
}
