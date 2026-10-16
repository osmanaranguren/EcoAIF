import React, { useEffect, useState } from 'react';
import { WasteItemSample, WasteCategoryInfo } from '../types.ts';
import { CheckCircle2, Trash2, Radar } from 'lucide-react';

interface ConfirmedViewProps {
  item: WasteItemSample;
  normativa: WasteCategoryInfo;
  onAreaCleared: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  isRealWebcamActive?: boolean;
}

export const ConfirmedView: React.FC<ConfirmedViewProps> = ({
  item,
  normativa,
  onAreaCleared,
  videoRef,
  isRealWebcamActive
}) => {
  const [cooldown, setCooldown] = useState(4);

  useEffect(() => {
    if (cooldown <= 0) {
      onAreaCleared();
      return;
    }

    const timer = setTimeout(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown, onAreaCleared]);

  const getNormativeBadge = () => {
    switch (normativa.id) {
      case 'Blanca':
        return {
          badgeBg: 'bg-white text-slate-900 border-slate-300 shadow-xs',
          label: 'Caneca Blanca'
        };
      case 'Verde':
        return {
          badgeBg: 'bg-emerald-600 text-white border-emerald-500 shadow-xs',
          label: 'Caneca Verde'
        };
      case 'Negra':
        return {
          badgeBg: 'bg-slate-900 text-white border-slate-800 shadow-xs',
          label: 'Caneca Negra'
        };
      case 'Roja_RESPEL':
        return {
          badgeBg: 'bg-rose-600 text-white border-rose-500 shadow-xs',
          label: 'Contenedor Rojo (RESPEL)'
        };
      case 'RAEE_Posconsumo':
        return {
          badgeBg: 'bg-indigo-600 text-white border-indigo-500 shadow-xs',
          label: 'Posconsumo RAEE'
        };
      default:
        return {
          badgeBg: 'bg-white text-slate-900 border-slate-300 shadow-xs',
          label: normativa.title
        };
    }
  };

  const badgeStyle = getNormativeBadge();

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Dimmed camera / object photo background */}
      {item.sampleImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs"
          style={{ backgroundImage: `url('${item.sampleImage}')` }}
        />
      ) : isRealWebcamActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900 opacity-20" />
      )}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />

      {/* Central Confirmation Card */}
      <div className="relative z-10 bg-white border border-slate-200 rounded-2xl p-8 md:p-10 flex flex-col items-center max-w-xl w-full shadow-xl overflow-hidden text-slate-900">
        {/* Checkmark Icon in geometric container */}
        <div className="mb-4 relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2
              className="w-9 h-9 text-emerald-600"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 text-center tracking-tight mb-6">
          ¡Disposición Registrada!
        </h1>

        {/* Summary Card with Captured Image */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            {item.sampleImage && (
              <img
                src={item.sampleImage}
                alt={item.name}
                className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-xs flex-shrink-0"
              />
            )}
            <div className="flex flex-col gap-0.5 text-left">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                Objeto Detectado
              </span>
              <span className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                {item.name}
              </span>
              {item.resinType !== 'N/A' && (
                <span className="text-xs font-mono text-indigo-600 font-medium">
                  Resina: {item.resinType} (Res. 803/2024)
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 items-start sm:items-end w-full sm:w-auto">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Destino Normativo
            </span>
            <div
              className={`px-3.5 py-1.5 border rounded-md flex items-center gap-2 font-semibold text-xs sm:text-sm ${badgeStyle.badgeBg}`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{badgeStyle.label}</span>
            </div>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="bg-amber-50 border border-amber-200 px-5 py-3.5 rounded-xl w-full text-center mb-6">
          <p className="text-sm md:text-base font-semibold text-amber-900">
            Retire el residuo del visor y deposítelo en la caneca correspondiente.
          </p>
        </div>

        {/* Progress / Waiting Area Cleared */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 pt-4 border-t border-slate-100 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2 bg-slate-100 py-1.5 px-3.5 rounded-md border border-slate-200">
            <Radar className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            <span className="tracking-wider">
              Esperando área despejada ({cooldown}s)...
            </span>
          </div>

          <button
            onClick={onAreaCleared}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors font-sans font-semibold text-xs shadow-xs cursor-pointer"
          >
            ✓ Área Despejada (Continuar)
          </button>
        </div>
      </div>
    </div>
  );
};
