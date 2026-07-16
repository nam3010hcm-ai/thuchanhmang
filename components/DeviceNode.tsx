import React from 'react';
import {
  Monitor, Laptop, Router as RouterIcon, Wifi, Cloud, Globe,
  Smartphone, Tablet, Watch
} from 'lucide-react';
import { Device } from '../types';
import { isWirelessClient } from '../utils/networkHelpers';
import { Led } from './Led';

interface DeviceNodeProps {
  device: Device;
  isActive: boolean;
  isSelected: boolean;
  isCableStart: boolean;
  isDragging: boolean;
  wiredPortCount: number;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
}

export const DeviceNode: React.FC<DeviceNodeProps> = ({
  device, isActive, isSelected, isCableStart, isDragging, wiredPortCount, onPointerDown
}) => {
  return (
    <div
      className={`absolute flex flex-col items-center select-none group transition-shadow ${isDragging ? 'z-50' : 'z-10'}`}
      style={{ left: device.x, top: device.y, touchAction: 'none' }}
      onPointerDown={(e) => onPointerDown(e, device.id)}
    >
      <div className={`p-2 rounded-xl border-2 transition-all duration-300 ${
        isSelected
          ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-110'
          : isCableStart
          ? 'bg-amber-500/20 border-amber-500 scale-105'
          : 'bg-slate-100 border-slate-300 hover:border-slate-400'
      }`}>
        {device.type === 'switch' && (
          <div className="w-32 h-12 flex flex-col justify-between p-1 bg-white rounded border border-slate-300">
            <div className="text-[6px] text-center text-slate-500 font-bold">CISCO CATALYST 24P</div>
            <div className="grid grid-cols-12 gap-0.5">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-black rounded-[1px] border border-slate-200 flex items-center justify-center">
                  {i < wiredPortCount && (
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse-fast"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {device.type === 'pc' && <Monitor size={48} className="text-slate-700" />}
        {device.type === 'laptop' && <Laptop size={48} className="text-slate-700" />}
        {device.type === 'router' && (
          <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
            <RouterIcon size={32} className="text-purple-400" />
          </div>
        )}
        {device.type === 'access_point' && (
          <div className="relative">
            <Wifi size={40} className="text-purple-300" />
            <div className="absolute -top-2 -right-2 w-1 h-6 bg-slate-500 rounded rotate-12"></div>
            <div className="absolute -top-2 -left-2 w-1 h-6 bg-slate-500 rounded -rotate-12"></div>
          </div>
        )}
        {device.type === 'isp' && <Cloud size={60} className="text-sky-400 animate-bounce [animation-duration:3s]" />}
        {isWirelessClient(device.type) && (
          <div className="relative p-2">
            {device.type === 'mobile' && <Smartphone size={28} className="text-pink-400" />}
            {device.type === 'tablet' && <Tablet size={32} className="text-pink-400" />}
            {device.type === 'watch' && <Watch size={20} className="text-pink-400" />}
            {isActive && (
              <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-0.5 shadow-lg">
                <Wifi size={8} className="text-white" />
              </div>
            )}
          </div>
        )}
        {device.type === 'modem' && (
          <div className="w-16 h-12 bg-white border-2 border-slate-300 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-1 left-1 flex gap-0.5">
              <Led status={isActive ? 'on' : 'off'} />
              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
            </div>
            <Globe size={24} className="text-amber-500/80 mb-0.5" />
            <span className="font-black text-[7px] text-slate-500 tracking-tighter uppercase">Cable Modem</span>
          </div>
        )}

        {device.type !== 'switch' && device.type !== 'modem' && (
          <div className="absolute bottom-1 right-1">
            <Led status={isActive ? 'on' : 'off'} />
          </div>
        )}
      </div>

      <div className="mt-2 text-center">
        <div className="text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded border border-slate-300 truncate max-w-[80px] shadow-sm">{device.name}</div>
        {device.ip && <div className="text-[8px] font-mono text-sky-600 mt-0.5">{device.ip}</div>}
      </div>
    </div>
  );
};
