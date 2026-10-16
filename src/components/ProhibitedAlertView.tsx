import React from 'react';
import { WasteItemSample } from '../types.ts';
import { AlertTriangle, Ban, Check, ShieldAlert } from 'lucide-react';

interface ProhibitedAlertViewProps {
  item: WasteItemSample;
  onDismissAlert: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  isRealWebcamActive?: boolean;
}

export const ProhibitedAlertView: React.FC<ProhibitedAlertViewProps> = ({
  item,
  onDismissAlert,
  videoRef,
  isRealWebcamActive
}) => {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-slate-100/70">
      {/* Top Banner (Full Width Red Banner) */}
      <div className="w-full bg-rose-600 text-white h-14 md:h-16 flex items-center justify-center px-6 z-30 shadow-sm border-b border-rose-700">
        <div className="flex items-center gap-2.5 text-center">
          <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 animate-bounce" />
          <h1 className="text-base md:text-xl font-bold tracking-tight uppercase">
            Producto Plástico de Un Solo Uso Prohibido (Ley 2232)
          </h1>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-8 items-stretch justify-center max-w-6xl mx-auto w-full">
        {/* Left: Camera Viewport with Red Reticle */}
        <div className="flex-1 relative bg-slate-950 rounded-xl border border-rose-500/30 overflow-hidden min-h-[320px] flex items-center justify-center shadow-md">
          {/* Video or Captured Photo Snapshot */}
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
              className="absolute inset-0 w-full h-full object-cover filter contrast-125"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900" />
          )}

          {/* Reticle Corners */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-rose-400/80" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-rose-400/80" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-rose-400/80" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-rose-400/80" />

          {/* Urgent Red Bounding Box */}
          <div className="relative w-[260px] md:w-[320px] h-[260px] md:h-[320px] border-3 border-rose-600 bg-rose-600/10 flex flex-col justify-end p-2.5">
            {/* Red Scanning Line */}
            <div className="absolute left-0 w-full h-[2px] bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-scan-line pointer-events-none" />

            <div className="bg-rose-600 text-white px-2.5 py-1 font-mono text-[11px] font-bold inline-flex items-center gap-1.5 w-max rounded-sm shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5" />
              DETECCIÓN NO PERMITIDA
            </div>
          </div>

          {/* Status Indicator on Top Right */}
          <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-800 font-mono text-xs text-white shadow-sm">
            SCAN_ACTV | CONF {item.confidence.toFixed(1)}%
          </div>
        </div>

        {/* Right HUD Panel: Alert Info */}
        <aside className="w-full lg:w-[400px] flex flex-col gap-4 justify-between">
          {/* Detection Tag Header */}
          <div className="bg-white border border-slate-200 border-l-4 border-l-rose-600 p-4 rounded-xl shadow-xs">
            <h2 className="text-lg md:text-xl font-bold text-rose-700 mb-0.5 font-mono">
              {item.name.toUpperCase()}
            </h2>
            <div className="text-sm font-semibold text-slate-800 font-mono tracking-tight">
              PROHIBIDO · LEY 2232 DE 2022
            </div>
          </div>

          {/* Warning Instructions Card */}
          <div className="flex-1 bg-rose-50 border border-rose-200 rounded-xl p-5 md:p-6 flex flex-col justify-center shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center border border-rose-300">
                <Ban className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="text-xl font-bold text-rose-900 tracking-tight">
                Disposición Restringida
              </h3>
            </div>

            <p className="text-sm md:text-base text-slate-700 mb-4 leading-relaxed">
              Este artículo está clasificado como Plástico de Un Solo Uso bajo la{' '}
              <strong className="text-rose-900 font-bold">
                Ley 2232 de 2022
              </strong>{' '}
              y <strong className="text-rose-700 font-bold">no debe</strong> ser depositado en los contenedores comunes de este punto ecológico.
            </p>

            {/* Action Required Box */}
            <div className="bg-white border border-rose-200/80 rounded-lg p-3.5 shadow-xs">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-rose-800 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                Acción Requerida
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Por favor, retire el objeto del área de escaneo. Entréguelo en puntos de posconsumo o retorne al distribuidor autorizado.
              </p>
            </div>
          </div>

          {/* Bottom Action Button */}
          <button
            onClick={onDismissAlert}
            className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            He retirado el objeto
          </button>
        </aside>
      </div>
    </div>
  );
};
