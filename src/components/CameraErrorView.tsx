import React, { useState, useEffect } from 'react';
import { CameraOff, RefreshCw } from 'lucide-react';

interface CameraErrorViewProps {
  onRetryConnection: () => void;
  isRetrying?: boolean;
}

export const CameraErrorView: React.FC<CameraErrorViewProps> = ({
  onRetryConnection,
  isRetrying = false
}) => {
  const [sysTime, setSysTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setSysTime(now.toLocaleTimeString('en-US', { hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-50 tech-grid">
      {/* Central Error Card */}
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 md:p-10 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
        {/* Pulsing Icon */}
        <div className="w-16 h-16 rounded-xl bg-rose-50 flex items-center justify-center mb-5 border border-rose-200 shadow-xs">
          <CameraOff className="w-8 h-8 text-rose-600" />
        </div>

        {/* Title & Body */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">
          Cámara no detectada o desconectada
        </h2>
        <p className="text-sm md:text-base text-slate-600 mb-6 max-w-md leading-relaxed">
          El sistema de visión artificial no responde. La clasificación óptica automática se encuentra temporalmente deshabilitada.
        </p>

        {/* Retry Button */}
        <button
          onClick={onRetryConnection}
          disabled={isRetrying}
          className="h-11 px-5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2 font-medium text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Reintentando conexión...' : 'Reintentar conexión de cámara'}
        </button>

        {/* Technical Readout */}
        <div className="mt-6 pt-4 border-t border-slate-100 w-full flex justify-between text-slate-400 font-mono text-[11px]">
          <span>ERR_CODE: CAM_TIMEOUT_0x4F</span>
          <span>SYS_TIME: {sysTime || '2:55:49 PM'}</span>
        </div>
      </div>

      {/* Footer State Text Pill */}
      <div className="mt-6 font-mono text-xs text-rose-700 flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-200 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
        Dispositivo: Standalone Offline · Esperando señal de video
      </div>
    </div>
  );
};
