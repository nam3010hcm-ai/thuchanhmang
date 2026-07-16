import { Device, DeviceType, Connection, NetworkSnapshotData } from '../types';
import { generateMac } from '../utils/networkHelpers';

let seq = 0;
/** Sinh id duy nhất mỗi lần gọi template, tránh đụng độ với thiết bị đang có trong lab hoặc giữa các lần tải template. */
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${seq++}`;

function makeDevice(partial: Omit<Device, 'id' | 'mac'> & { idPrefix: DeviceType }): Device {
  const { idPrefix, ...rest } = partial;
  return { ...rest, id: nextId(idPrefix), mac: generateMac() };
}

export interface TopologyTemplate {
  id: string;
  name: string;
  description: string;
  build: () => NetworkSnapshotData;
}

export const topologyTemplates: TopologyTemplate[] = [
  {
    id: 'star-lan',
    name: 'Mạng LAN hình sao (Star)',
    description: '1 Switch trung tâm nối 3 PC cùng dải mạng 192.168.1.0/24. Bài học cơ bản về Switch và cùng subnet.',
    build: () => {
      const sw = makeDevice({ idPrefix: 'switch', type: 'switch', name: 'Switch-1', x: 450, y: 220, ports: 24 });
      const pcs = [0, 1, 2].map(i => makeDevice({
        idPrefix: 'pc', type: 'pc', name: `PC-${i + 1}`, x: 250 + i * 220, y: 400,
        ip: `192.168.1.${11 + i}`, mask: '255.255.255.0', ports: 1
      }));
      const connections: Connection[] = pcs.map(pc => ({ id: `${pc.id}-${sw.id}`, sourceId: pc.id, targetId: sw.id }));
      return { devices: [sw, ...pcs], connections };
    }
  },
  {
    id: 'router-two-subnets',
    name: 'Router liên kết 2 subnet',
    description: 'Router nối 2 Switch, mỗi Switch phục vụ 1 dải mạng riêng (192.168.1.0/24 và 192.168.2.0/24). Dùng để luyện tập ping cùng subnet vs khác subnet qua Router.',
    build: () => {
      const router = makeDevice({
        idPrefix: 'router', type: 'router', name: 'Router-1', x: 500, y: 150, ports: 4,
        ip: '192.168.1.1', mask: '255.255.255.0', dhcpServerEnabled: false
      });
      const sw1 = makeDevice({ idPrefix: 'switch', type: 'switch', name: 'Switch-Phong-A', x: 280, y: 320, ports: 24 });
      const sw2 = makeDevice({ idPrefix: 'switch', type: 'switch', name: 'Switch-Phong-B', x: 720, y: 320, ports: 24 });
      const pcsA = [0, 1].map(i => makeDevice({
        idPrefix: 'pc', type: 'pc', name: `PC-A${i + 1}`, x: 180 + i * 160, y: 460,
        ip: `192.168.1.${11 + i}`, mask: '255.255.255.0', ports: 1
      }));
      const pcsB = [0, 1].map(i => makeDevice({
        idPrefix: 'pc', type: 'pc', name: `PC-B${i + 1}`, x: 640 + i * 160, y: 460,
        // Lưu ý sư phạm: PC-B2 cố tình để dải mạng SAI (192.168.1.x thay vì 192.168.2.x)
        // để học sinh thực hành phát hiện lỗi cấu hình sai subnet.
        ip: i === 0 ? `192.168.2.11` : `192.168.1.99`, mask: '255.255.255.0', ports: 1
      }));
      const connections: Connection[] = [
        { id: `${router.id}-${sw1.id}`, sourceId: router.id, targetId: sw1.id },
        { id: `${router.id}-${sw2.id}`, sourceId: router.id, targetId: sw2.id },
        ...pcsA.map(pc => ({ id: `${pc.id}-${sw1.id}`, sourceId: pc.id, targetId: sw1.id })),
        ...pcsB.map(pc => ({ id: `${pc.id}-${sw2.id}`, sourceId: pc.id, targetId: sw2.id })),
      ];
      return { devices: [router, sw1, sw2, ...pcsA, ...pcsB], connections };
    }
  },
  {
    id: 'wifi-basic',
    name: 'Mạng Wifi cơ bản + Internet',
    description: 'Modem - Router (bật DHCP) - Access Point, có 2 điện thoại chưa kết nối. ISP đại diện Internet. Dùng để luyện SSID/mật khẩu Wifi và DHCP.',
    build: () => {
      const isp = makeDevice({ idPrefix: 'isp', type: 'isp', name: 'ISP', x: 850, y: 100, ip: '8.8.8.8', ports: 99 });
      const modem = makeDevice({ idPrefix: 'modem', type: 'modem', name: 'Modem-1', x: 600, y: 220, ports: 2 });
      const router = makeDevice({
        idPrefix: 'router', type: 'router', name: 'Router-1', x: 400, y: 320, ports: 4,
        ip: '192.168.1.1', mask: '255.255.255.0', dhcpServerEnabled: true
      });
      const ap = makeDevice({
        idPrefix: 'access_point', type: 'access_point', name: 'AP-1', x: 250, y: 450, ports: 1,
        ssid: 'NetLab_WiFi', password: '12345678'
      });
      const phones = [0, 1].map(i => makeDevice({
        idPrefix: 'mobile', type: 'mobile', name: `Phone-${i + 1}`, x: 120 + i * 160, y: 580, ports: 0
      }));
      const connections: Connection[] = [
        { id: `${modem.id}-${isp.id}`, sourceId: modem.id, targetId: isp.id },
        { id: `${router.id}-${modem.id}`, sourceId: router.id, targetId: modem.id },
        { id: `${ap.id}-${router.id}`, sourceId: ap.id, targetId: router.id },
      ];
      // Điện thoại CHƯA nối Wifi sẵn — học sinh phải tự bấm nối và nhập đúng SSID/mật khẩu
      return { devices: [isp, modem, router, ap, ...phones], connections };
    }
  }
];
