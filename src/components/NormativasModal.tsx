import React from 'react';
import { NORMATIVAS_INFO } from '../data/normativas.ts';
import { NormativeCaneca } from '../types.ts';
import { X, CheckCircle2, AlertOctagon, BookOpen } from 'lucide-react';

interface NormativasModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory?: NormativeCaneca | null;
}

export const NormativasModal: React.FC<NormativasModalProps> = ({
  isOpen,
  onClose,
  selectedCategory
}) => {
  if (!isOpen) return null;

  const categories = Object.values(NORMATIVAS_INFO);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Código de Colores y Normativa Ambiental (Colombia)
              </h3>
              <p className="text-xs text-slate-500">
                Resolución 2184/2019 · Ley 2232/2022 · Res. 803/2024 · Dec. 4741/2005 · Ley 1672/2013
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 6 Categories */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-[calc(90vh-140px)]">
          {categories.map((cat) => {
            const isHighlight = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`p-5 rounded-xl border transition-all ${
                  isHighlight
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0 border border-slate-300 shadow-xs"
                      style={{ backgroundColor: cat.colorHex }}
                    />
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      {cat.title}
                      <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                        {cat.baseNorm}
                      </span>
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 border border-slate-300 font-semibold w-max">
                    {cat.subIndicator}
                  </span>
                </div>

                <p className="text-sm text-slate-700 mb-3 italic">
                  "{cat.instructions}"
                </p>

                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-1.5 font-bold">
                    Residuos admitidos / características:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                    {cat.allowedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        {cat.id === 'Prohibido_Ley2232' ? (
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
