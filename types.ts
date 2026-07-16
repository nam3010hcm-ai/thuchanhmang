
export type DeviceType = 'pc' | 'switch' | 'router' | 'modem' | 'isp' | 'access_point' | 'laptop' | 'mobile' | 'tablet' | 'watch';

export interface Device {
  id: string;
  type: DeviceType;
  x: number;
  y: number;
  name: string;
  ip?: string;
  /** Subnet mask, chỉ có ý nghĩa khi device có `ip`. Mặc định 255.255.255.0 (/24) nếu bỏ trống. */
  mask?: string;
  mac: string;
  ports: number;
  ssid?: string;
  password?: string;
  /** Chỉ dùng cho type === 'router': bật/tắt việc router này cấp IP tự động (DHCP) cho client trong tầm với. */
  dhcpServerEnabled?: boolean;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface Log {
  id: number;
  text: string;
  type: 'info' | 'success' | 'error';
}

export enum ToolMode {
  MOVE = 'move',
  CABLE = 'cable',
  DELETE = 'delete'
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Một sơ đồ mạng đầy đủ, dùng cho thư viện topology mẫu và xuất/nhập file .json */
export interface NetworkSnapshotData {
  devices: Device[];
  connections: Connection[];
}

/** Kết quả kiểm tra 1 tiêu chí trong Đề bài */
export interface ExerciseCheckResult {
  id: string;
  label: string;
  passed: boolean;
}

/** Một Đề bài thực hành: giáo viên định nghĩa đề + hàm tự chấm dựa trên sơ đồ học sinh dựng */
export interface Exercise {
  id: string;
  title: string;
  description: string;
  validate: (devices: Device[], connections: Connection[]) => ExerciseCheckResult[];
}

