import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 text-white px-4 py-3 text-xs font-medium shadow-2xl backdrop-blur-md border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1">
        <span className="font-bold block text-slate-100">Offline Mode Active</span>
        <span className="text-[11px] text-slate-400">
          Showing cached clinical data. Actions will sync when online.
        </span>
      </div>
    </div>
  );
};
