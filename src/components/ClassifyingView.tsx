import React from 'react';
import { WasteItemSample, WasteCategoryInfo } from '../types.ts';
import { Trash2, AlertTriangle, Cpu, Leaf } from 'lucide-react';

interface ClassifyingViewProps {
  item: WasteItemSample;
  normativa: WasteCategoryInfo;
  persistenceProgress: number; // 0 to 100
  onCancelScan?: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  isRealWebcamActive?: boolean;
}

export const ClassifyingView: React.FC<ClassifyingViewProps> = ({
  item,
  normativa,
  persistenceProgress,
  onCancelScan,
  videoRef,
  isRealWebcamActive
}) => {
  const getNormativeCardStyle = () => {
    switch (normativa.id) {
      case 'Blanca':
        return {
          cardBg: 'bg-white text-slate-900 border-2 border-slate-300 shadow-md',
          iconColor: 'text-slate-900',
          textColor: 'text-slate-900',
          subColor: 'text-slate-600',
          title: 'DEPOSITAR EN: CANECA BLANCA',
          icon: <Trash2 className="w-16 h-16 text-slate-900 mb-3 stroke-[1.5]" />
        };
      case 'Verde':
        return {
          cardBg: 'bg-emerald-600 text-white border-2 border-emerald-500 shadow-md',
          iconColor: 'text-white',
          textColor: 'text-white',
          subColor: 'text-emerald-50',
          title: 'DEPOSITAR EN: CANECA VERDE',
          icon: <Leaf className="w-16 h-16 text-white mb-3 stroke-[1.5]" />
        };
      case 'Negra':
        return {
          cardBg: 'bg-slate-900 text-white border-2 border-slate-800 shadow-md',
          iconColor: 'text-white',
          textColor: 'text-white',
          subColor: 'text-slate-300',
          title: 'DEPOSITAR EN: CANECA NEGRA',
          icon: <Trash2 className="w-16 h-16 text-white mb-3 stroke-[1.5]" />
        };
      case 'Roja_RESPEL':
        return {
          cardBg: 'bg-rose-600 text-white border-2 border-rose-500 shadow-md',
          iconColor: 'text-white',
          textColor: 'text-white',
          subColor: 'text-rose-50',
          title: 'DEPOSITAR EN: CONTENEDOR ROJO (RESPEL)',
          icon: <AlertTriangle className="w-16 h-16 text-white mb-3 stroke-[1.5]" />
        };
      case 'RAEE_Posconsumo':
        return {
          cardBg: 'bg-indigo-600 text-white border-2 border-indigo-500 shadow-md',
          iconColor: 'text-white',
          textColor: 'text-white',
          subColor: 'text-indigo-50',
          title: 'DEPOSITAR EN: POSCONSUMO RAEE',
          icon: <Cpu className="w-16 h-16 text-white mb-3 stroke-[1.5]" />
        };
      default:
        return {
          cardBg: 'bg-white text-slate-900 border-2 border-slate-300 shadow-md',
          iconColor: 'text-slate-900',
          textColor: 'text-slate-900',
          subColor: 'text-slate-600',
          title: `DEPOSITAR EN: ${normativa.title.toUpperCase()}`,
          icon: <Trash2 className="w-16 h-16 text-slate-900 mb-3 stroke-[1.5]" />
        };
    }
  };

  const cardStyle = getNormativeCardStyle();

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-8 relative">
      <div className="w-full max-w-5xl h-full flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center">
        {/* Left Viewport: Camera & Bounding Box */}
        <div className="relative w-full md:w-1/2 h-[340px] md:h-[460px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md flex items-center justify-center">
          {/* Frozen captured snapshot of the object */}
          {item.sampleImage ? (
            <img
              src={item.sampleImage}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover filter contrast-110"
            />
          ) : isRealWebcamActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-95"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900" />
          )}

          {/* Optical Grid lines */}
          <div className="absolute inset-0 tech-grid-dark opacity-40 pointer-events-none" />

          {/* High-Tech Bounding Box */}
          <div className="relative w-[78%] h-[78%] border-2 border-indigo-400/80 bg-indigo-500/5 backdrop-blur-[1px] shadow-sm">
            {/* Corners */}
            <div className="corner-tl !border-indigo-400" />
            <div className="corner-tr !border-indigo-400" />
            <div className="corner-bl !border-indigo-400" />
            <div className="corner-br !border-indigo-400" />

            {/* Scanning Line */}
            <div className="absolute left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-scan-line pointer-events-none" />

            {/* Label Tag on Top */}
            <div className="absolute -top-9 left-0 bg-slate-900 border border-slate-700 px-3 py-1 flex items-center gap-2 rounded-t shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-white tracking-wider whitespace-nowrap">
                {item.category.toUpperCase()} · RESINA: {item.resinType} · {item.confidence.toFixed(1)}% CONF
              </span>
            </div>
          </div>

          {/* Sensor Readouts on bottom-left */}
          <div className="absolute bottom-3 left-3 font-mono text-[10px] text-slate-300 flex flex-col gap-0.5 bg-slate-900/90 p-2 rounded-md border border-slate-700 shadow-xs">
            <div>{item.sensorOverlay.optSensor}</div>
            <div>{item.sensorOverlay.specAnalysis}</div>
            <div className="text-emerald-400 font-semibold">{item.sensorOverlay.irReflectance}</div>
          </div>
        </div>

        {/* Right Viewport: Normative Card & Anti-Rebote Persistence Bar */}
        <div className="relative w-full md:w-1/2 flex flex-col justify-center max-w-md">
          {/* Normative Destination Card */}
          <div
            className={`rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 ${cardStyle.cardBg}`}
          >
            {cardStyle.icon}

            <h2 className={`text-xl md:text-2xl font-bold tracking-tight mb-2 ${cardStyle.textColor}`}>
              {cardStyle.title}
            </h2>

            <p className={`text-sm md:text-base max-w-sm font-medium ${cardStyle.subColor}`}>
              {item.disposalAdvice}
            </p>

            <div className="mt-4 inline-block font-mono text-xs px-2.5 py-0.5 rounded bg-black/10 border border-current opacity-80">
              {normativa.baseNorm}
            </div>
          </div>

          {/* Persistence Bar (Filtro Anti-Rebote PRD 4.3) */}
          <div className="mt-6 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden border border-slate-200 p-0.5">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-100 relative"
                style={{ width: `${persistenceProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            <div className="mt-2.5 flex justify-between items-center font-mono text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                Validando persistencia óptica...
              </span>
              <span className="font-bold text-slate-900 text-sm">{Math.round(persistenceProgress)}%</span>
            </div>
          </div>

          {/* Cancel button */}
          {onCancelScan && (
            <div className="mt-3 text-center">
              <button
                onClick={onCancelScan}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-sans cursor-pointer"
              >
                Cancelar escaneo y volver a standby
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
