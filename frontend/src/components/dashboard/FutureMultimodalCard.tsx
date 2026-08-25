"use client";

import React from "react";
import { Layers, CheckCircle2, Lock, Sparkles } from "lucide-react";

export const FutureMultimodalCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-stone-900 to-slate-900 text-white rounded-2xl p-6 border border-stone-800 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold tracking-wide text-white uppercase">Future Expansion</h3>
            <p className="text-[10px] text-stone-400">Multi-Modal Diagnostic Roadmap</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span>Multi-Modal v3.0</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Active: Pressure Matrix */}
        <div className="p-3 rounded-xl bg-stone-800/80 border border-teal-500/50 space-y-1">
          <div className="flex items-center justify-between text-teal-400 font-bold text-[10px]">
            <span>Pressure Matrix</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <p className="text-[10px] text-stone-300 font-semibold">Active & Live</p>
        </div>

        {/* Coming Soon: Footprint Image */}
        <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-700/60 opacity-65 space-y-1 cursor-not-allowed">
          <div className="flex items-center justify-between text-stone-400 font-bold text-[10px]">
            <span>Footprint Image</span>
            <Lock className="w-3 h-3 text-amber-400" />
          </div>
          <p className="text-[10px] text-amber-400 font-semibold">Coming Soon</p>
        </div>

        {/* Coming Soon: Clinical Metadata */}
        <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-700/60 opacity-65 space-y-1 cursor-not-allowed">
          <div className="flex items-center justify-between text-stone-400 font-bold text-[10px]">
            <span>Clinical Metadata</span>
            <Lock className="w-3 h-3 text-amber-400" />
          </div>
          <p className="text-[10px] text-amber-400 font-semibold">Coming Soon</p>
        </div>

        {/* Coming Soon: Patient History */}
        <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-700/60 opacity-65 space-y-1 cursor-not-allowed">
          <div className="flex items-center justify-between text-stone-400 font-bold text-[10px]">
            <span>Patient History</span>
            <Lock className="w-3 h-3 text-amber-400" />
          </div>
          <p className="text-[10px] text-amber-400 font-semibold">Coming Soon</p>
        </div>
      </div>

      <p className="text-[11px] text-stone-400 leading-normal">
        Future releases will fuse pressure matrix grids with optical footprint alignment, HbA1c lab metadata, and longitudinal history for enhanced multi-modal clinical decision support.
      </p>
    </div>
  );
};
