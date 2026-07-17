import React from 'react';

export type LedStatus = 'off' | 'on' | 'activity' | 'error';

export const Led: React.FC<{ status: LedStatus }> = ({ status }) => {
  let color = 'bg-slate-300';
  if (status === 'on') color = 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]';
  if (status === 'activity') color = 'bg-yellow-400 animate-pulse';
  if (status === 'error') color = 'bg-red-500 animate-pulse';
  return <div className={`w-1.5 h-1.5 rounded-full ${color} transition-all duration-200 border border-slate-300`}></div>;
};
