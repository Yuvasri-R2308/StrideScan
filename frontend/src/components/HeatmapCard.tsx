"use client";

import React, { useState } from "react";
import { Eye, Maximize2, X, Info } from "lucide-react";

interface HeatmapCardProps {
  heatmapBase64: string;
}

export const HeatmapCard: React.FC<HeatmapCardProps> = ({ heatmapBase64 }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format base64 src string cleanly
  const imageSrc = heatmapBase64.startsWith("data:")
    ? heatmapBase64
    : `data:image/png;base64,${heatmapBase64}`;

  return (
    <>
      <div className="card-apple p-6 flex flex-col items-center relative overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Plantar Pressure Heatmap
            </h3>
            <p className="text-xs text-slate-400">
              Anatomically interpolated 2D pressure distribution (256x256)
            </p>
          </div>
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 transition-colors"
            title="View Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Heatmap Image Container */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl bg-black/90 p-4 border border-slate-200 shadow-inner flex items-center justify-center relative group">
          <img
            src={imageSrc}
            alt="Plantar Pressure Heatmap"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div 
            onClick={() => setIsFullscreen(true)}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center cursor-pointer"
          >
            <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full">
              <Eye className="w-3.5 h-3.5" />
              <span>Expand Scan</span>
            </span>
          </div>
        </div>

        {/* Color Legend Bar */}
        <div className="w-full mt-5 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mb-1.5">
            <span>Low Pressure</span>
            <span>Peak Pressure</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-400 to-red-600 shadow-xs" />
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Plantar Pressure Heatmap (High Res)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Detailed pressure gradient mapping across calcaneus, arch, and metatarsals.
            </p>

            <div className="bg-black rounded-2xl p-4 flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Plantar Pressure Heatmap Enlarged"
                className="w-full max-h-[400px] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
