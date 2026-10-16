import React from 'react';
import { NormativeCaneca } from '../types.ts';

interface FooterNormativeBarProps {
  onSelectNormativa: (norm: NormativeCaneca) => void;
}

export const FooterNormativeBar: React.FC<FooterNormativeBarProps> = ({ onSelectNormativa }) => {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-sm">
      {/* Normative Pills */}
      <div className="flex items-center gap-2 sm:gap-3 max-w-2xl w-full">
        {/* Caneca Blanca */}
        <button
          onClick={() => onSelectNormativa('Blanca')}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-md px-2 sm:px-3 py-1.5 transition-all shadow-xs cursor-pointer group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-400" />
          <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-slate-800 whitespace-nowrap">
            Aprovechables
          </span>
        </button>

        {/* Caneca Verde */}
        <button
          onClick={() => onSelectNormativa('Verde')}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-md px-2 sm:px-3 py-1.5 transition-all shadow-xs cursor-pointer group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-emerald-800 whitespace-nowrap">
            Orgánicos
          </span>
        </button>

        {/* Caneca Negra */}
        <button
          onClick={() => onSelectNormativa('Negra')}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-md px-2 sm:px-3 py-1.5 transition-all shadow-xs cursor-pointer group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-slate-100 whitespace-nowrap">
            No Aprovechables
          </span>
        </button>
      </div>

      {/* Normative Quick Reference Links */}
      <div className="hidden lg:flex items-center gap-4 text-[11px] font-medium text-slate-600">
        <button
          onClick={() => onSelectNormativa('Roja_RESPEL')}
          className="hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          RESPEL (Dec. 4741)
        </button>
        <button
          onClick={() => onSelectNormativa('RAEE_Posconsumo')}
          className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          RAEE (Ley 1672)
        </button>
        <button
          onClick={() => onSelectNormativa('Prohibido_Ley2232')}
          className="hover:text-rose-700 text-rose-600 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
          Ley 2232 (Prohibidos)
        </button>
      </div>
    </footer>
  );
};
