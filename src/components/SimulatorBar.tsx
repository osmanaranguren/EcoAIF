import React from 'react';
import { WASTE_SAMPLES } from '../data/normativas.ts';
import { KioskState } from '../types.ts';
import {
  Camera,
  CameraOff,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronDown,
  X
} from 'lucide-react';

interface SimulatorBarProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: KioskState;
  onSelectSample: (sampleId: string) => void;
  onClearArea: () => void;
  onTriggerCameraError: () => void;
  onRestoreCamera: () => void;
  isRealWebcamActive: boolean;
  onToggleWebcam: () => void;
}

export const SimulatorBar: React.FC<SimulatorBarProps> = ({
  isOpen,
  onClose,
  currentState,
  onSelectSample,
  onClearArea,
  onTriggerCameraError,
  onRestoreCamera,
  isRealWebcamActive,
  onToggleWebcam
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-14 left-0 w-full z-40 bg-slate-900/98 border-t border-slate-800 backdrop-blur-xl shadow-2xl p-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
              Consola de Sensores & Visor Óptico (Kiosk Simulator)
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Estado: <strong className="text-emerald-400">{currentState.toUpperCase()}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Ocultar consola"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Samples selection buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400 mr-1">
              Insertar Residuo:
            </span>

            {WASTE_SAMPLES.map((sample) => {
              const isLey2232 = sample.isLey2232Prohibited;
              return (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isLey2232
                      ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-800/80'
                      : sample.caneca === 'Blanca'
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
                      : sample.caneca === 'Verde'
                      ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/80'
                      : sample.caneca === 'Roja_RESPEL'
                      ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-800/80'
                      : sample.caneca === 'RAEE_Posconsumo'
                      ? 'bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border-indigo-800/80'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isLey2232 && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                  <span>{sample.name}</span>
                </button>
              );
            })}
          </div>

          {/* System Control Actions */}
          <div className="flex items-center gap-2">
            {/* Clear Area Button */}
            <button
              onClick={onClearArea}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              Despejar Visor
            </button>

            {/* Webcam Toggle */}
            <button
              onClick={onToggleWebcam}
              className={`px-3 py-1.5 rounded-md font-mono text-xs border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isRealWebcamActive
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              {isRealWebcamActive ? 'Cámara: ON' : 'Cámara Real'}
            </button>

            {/* Error simulation */}
            {currentState === 'camera_error' ? (
              <button
                onClick={onRestoreCamera}
                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold font-mono text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Reconectar Cámara
              </button>
            ) : (
              <button
                onClick={onTriggerCameraError}
                className="px-3 py-1.5 rounded-md bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CameraOff className="w-3.5 h-3.5" />
                Simular Error
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
