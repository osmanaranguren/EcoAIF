import React from 'react';
import { AlertCircle, X, Lightbulb, Move } from 'lucide-react';

interface LowConfidenceToastProps {
  confidence: number;
  onDismiss: () => void;
  onRetry: () => void;
}

export const LowConfidenceToast: React.FC<LowConfidenceToastProps> = ({
  confidence,
  onDismiss,
  onRetry
}) => {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-white border border-amber-300 rounded-xl p-4 sm:p-5 shadow-xl text-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  Detección No Concluyente ({confidence.toFixed(1)}%)
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                  UMBRAL &lt; 85%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Residuo no identificado con certeza suficiente. Por favor acerque el objeto, asegure iluminación adecuada o verifique si contiene restos contaminantes.
              </p>

              {/* Suggestions */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                  <Move className="w-3.5 h-3.5 text-emerald-600" />
                  Ajustar distancia (20-30 cm)
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Evitar reflejos excesivos
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium cursor-pointer"
          >
            Cerrar aviso
          </button>
          <button
            onClick={onRetry}
            className="px-4 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Reintentar enfoque
          </button>
        </div>
      </div>
    </div>
  );
};
