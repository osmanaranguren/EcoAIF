import React from 'react';
import { CloudOff, Radio, Shield, Database, BookOpen, Sliders } from 'lucide-react';

interface TopAppBarProps {
  onOpenAudit: () => void;
  onOpenNormativas: () => void;
  onToggleSimulator: () => void;
  isSimulatorOpen: boolean;
  kioskId?: string;
  isOffline?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenAudit,
  onOpenNormativas,
  onToggleSimulator,
  isSimulatorOpen,
  kioskId = 'Kiosk #4022',
  isOffline = true
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 h-16 bg-slate-900 border-b border-slate-800 px-6 md:px-8 flex items-center justify-between text-slate-200">
      {/* Brand & Institution */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
          Δ
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base md:text-lg font-semibold text-white tracking-tight">
              Punto Ecológico Inteligente
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-800 text-indigo-400 border border-slate-700 rounded text-[10px] font-bold uppercase tracking-wider">
              v2.4.1-STANDALONE
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden md:block">
            Normativa Res. 2184/2019 · Ley 2232/2022 · Res. 803/2024
          </p>
        </div>
      </div>

      {/* Badges and Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Badge */}
        {isOffline && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 text-xs font-medium">
            <CloudOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline text-[11px] font-semibold text-slate-300">
              Offline Standalone
            </span>
          </div>
        )}

        {/* Kiosk ID */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>{kioskId}</span>
        </div>

        {/* Action: Normativas Guide */}
        <button
          onClick={onOpenNormativas}
          title="Ver Guía de Normativas"
          className="px-2.5 sm:px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Normativas</span>
        </button>

        {/* Action: SQLite / CSV Auditor */}
        <button
          onClick={onOpenAudit}
          title="Auditoría SQLite & CSV"
          className="px-2.5 sm:px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Auditoría / CSV</span>
        </button>

        {/* Action: Toggle Sensor Test Bed */}
        <button
          onClick={onToggleSimulator}
          title="Controles de Sensor y Pruebas"
          className={`px-2.5 sm:px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            isSimulatorOpen
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm font-semibold'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sensor Kiosk</span>
        </button>
      </div>
    </header>
  );
};
