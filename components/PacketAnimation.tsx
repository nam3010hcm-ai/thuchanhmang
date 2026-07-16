import React from 'react';

interface PacketAnimationProps {
  /** Danh sách toạ độ các điểm gói tin sẽ đi qua, theo thứ tự. */
  points: { x: number; y: number }[];
  /** Tổng thời gian chạy hết đường đi (ms). */
  durationMs: number;
  /** Đổi giá trị này (VD: timestamp) mỗi lần ping để buộc hoạt ảnh chạy lại từ đầu. */
  animationKey: string | number;
  color?: string;
}

export const PacketAnimation: React.FC<PacketAnimationProps> = ({ points, durationMs, animationKey, color = '#3b82f6' }) => {
  if (points.length < 2) return null;

  const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;

  return (
    <g key={animationKey}>
      <circle r="5" fill={color} className="drop-shadow">
        <animateMotion
          path={pathD}
          dur={`${Math.max(durationMs, 200)}ms`}
          begin="0s"
          fill="freeze"
          calcMode="linear"
        />
      </circle>
    </g>
  );
};
