import { Device, Connection, Exercise, ExerciseCheckResult } from '../types';
import {
  bfsPath, checkConnectionToType, countDistinctSubnets, pathContainsRouter
} from '../utils/networkAnalysis';

/**
 * Cách thêm đề bài mới: thêm 1 object vào mảng `exercises` bên dưới, với hàm `validate`
 * nhận vào (devices, connections) hiện tại của học sinh và trả về danh sách tiêu chí
 * kèm true/false. Bảng tiêu chí sẽ tự cập nhật realtime trong Sidebar khi học sinh dựng sơ đồ.
 */
export const exercises: Exercise[] = [
  {
    id: 'ex-basic-lan',
    title: 'Bài 1: Mạng LAN cơ bản',
    description:
      'Dựng một mạng LAN gồm ít nhất 1 Switch và 3 máy trạm (PC/Laptop) cùng dải mạng 192.168.1.0/24, ' +
      'tất cả kết nối vật lý với Switch và ping thông nhau.',
    validate: (devices: Device[], connections: Connection[]): ExerciseCheckResult[] => {
      const switches = devices.filter(d => d.type === 'switch');
      const clients = devices.filter(d => ['pc', 'laptop'].includes(d.type));
      const hasSwitch = switches.length >= 1;
      const hasEnoughClients = clients.length >= 3;
      const sameSubnetCount = countDistinctSubnets(clients) <= 1 && clients.length > 0;
      const allClientsConnected = hasSwitch && clients.every(c =>
        switches.some(sw => bfsPath(c.id, sw.id, connections) !== null)
      );
      return [
        { id: 'has-switch', label: 'Có ít nhất 1 Switch', passed: hasSwitch },
        { id: 'has-clients', label: 'Có ít nhất 3 máy trạm (PC/Laptop)', passed: hasEnoughClients },
        { id: 'same-subnet', label: 'Các máy trạm cùng 1 dải mạng (subnet)', passed: sameSubnetCount },
        { id: 'all-connected', label: 'Tất cả máy trạm nối được tới Switch', passed: allClientsConnected },
      ];
    }
  },
  {
    id: 'ex-router-two-subnets',
    title: 'Bài 2: Chia 2 phòng bằng Router',
    description:
      'Dựng 2 phòng máy, mỗi phòng có 1 Switch và ít nhất 2 PC thuộc 2 dải mạng KHÁC NHAU ' +
      '(ví dụ 192.168.1.0/24 và 192.168.2.0/24), 2 Switch nối chung với 1 Router để liên lạc được với nhau.',
    validate: (devices: Device[], connections: Connection[]): ExerciseCheckResult[] => {
      const routers = devices.filter(d => d.type === 'router');
      const switches = devices.filter(d => d.type === 'switch');
      const clients = devices.filter(d => ['pc', 'laptop'].includes(d.type));
      const hasRouter = routers.length >= 1;
      const hasTwoSwitches = switches.length >= 2;
      const hasTwoSubnets = countDistinctSubnets(clients) >= 2;

      let routerBridgesSubnets = false;
      if (hasRouter) {
        routerBridgesSubnets = switches.every(sw => bfsPath(sw.id, routers[0].id, connections) !== null);
      }

      // Kiểm tra thực tế: 2 PC ở 2 subnet khác nhau phải ping được nhau (đi qua Router)
      let crossSubnetPingWorks = false;
      if (hasTwoSubnets && clients.length >= 2) {
        outer: for (const a of clients) {
          for (const b of clients) {
            if (a.id === b.id || !a.ip || !b.ip) continue;
            const path = bfsPath(a.id, b.id, connections);
            if (path && pathContainsRouter(path, devices)) {
              crossSubnetPingWorks = true;
              break outer;
            }
          }
        }
      }

      return [
        { id: 'has-router', label: 'Có ít nhất 1 Router', passed: hasRouter },
        { id: 'has-switches', label: 'Có ít nhất 2 Switch (2 phòng)', passed: hasTwoSwitches },
        { id: 'two-subnets', label: 'Có 2 dải mạng (subnet) khác nhau', passed: hasTwoSubnets },
        { id: 'router-bridge', label: 'Router nối tới cả 2 Switch', passed: routerBridgesSubnets },
        { id: 'cross-ping', label: 'Có đường đi hợp lệ giữa 2 subnet qua Router', passed: crossSubnetPingWorks },
      ];
    }
  },
  {
    id: 'ex-internet-access',
    title: 'Bài 3: Kết nối Internet qua Modem/ISP',
    description:
      'Dựng sơ đồ: Router (bật DHCP) nối Modem, Modem nối ISP (Internet). ' +
      'Có ít nhất 1 máy trạm nhận IP tự động từ Router (không nhập tay) và ping thấy Internet.',
    validate: (devices: Device[], connections: Connection[]): ExerciseCheckResult[] => {
      const router = devices.find(d => d.type === 'router');
      const hasModem = devices.some(d => d.type === 'modem');
      const hasIsp = devices.some(d => d.type === 'isp');
      const dhcpOn = !!router?.dhcpServerEnabled;
      const clients = devices.filter(d => ['pc', 'laptop', 'mobile', 'tablet'].includes(d.type));
      const routerReachesIsp = router ? checkConnectionToType(router.id, 'isp', devices, connections) : false;
      const someClientReachesIsp = clients.some(c => checkConnectionToType(c.id, 'isp', devices, connections));

      return [
        { id: 'has-router', label: 'Có Router', passed: !!router },
        { id: 'has-modem', label: 'Có Modem', passed: hasModem },
        { id: 'has-isp', label: 'Có ISP (Internet)', passed: hasIsp },
        { id: 'dhcp-on', label: 'Router đã bật chế độ cấp DHCP', passed: dhcpOn },
        { id: 'router-isp', label: 'Router có đường đi tới ISP', passed: routerReachesIsp },
        { id: 'client-isp', label: 'Có máy trạm ping thấy Internet', passed: someClientReachesIsp },
      ];
    }
  }
];
