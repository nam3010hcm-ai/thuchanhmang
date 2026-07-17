import { DeviceType } from '../types';

export const generateMac = () => {
  const hex = "0123456789ABCDEF";
  let mac = "";
  for (let i = 0; i < 6; i++) {
    mac += hex.charAt(Math.floor(Math.random() * 16));
    mac += hex.charAt(Math.floor(Math.random() * 16));
    if (i < 5) mac += ":";
  }
  return mac;
};

export const isWirelessClient = (type: DeviceType) => ['mobile', 'tablet', 'watch'].includes(type);
