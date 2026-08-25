"use client";

import React, { useState } from "react";
import { Sparkles, Maximize2, X, Info } from "lucide-react";

interface GradCAMCardProps {
  gradcamBase64: string;
}

export const GradCAMCard: React.FC<GradCAMCardProps> = ({ gradcamBase64 }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageSrc = gradcamBase64.startsWith("data:")
    ? gradcamBase64
    : `data:image/png;base64,${gradcamBase64}`;

  return (
    <>
      <div className="card-apple p-6 flex flex-col items-center relative overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                GradCAM Explainability Map
              </h3>
              <p className="text-xs text-slate-400">
                EfficientNetB0 gradient class activation visualization
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 transition-colors"
            title="View Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Image Display */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl bg-black/90 p-4 border border-slate-200 shadow-inner flex items-center justify-center relative group">
          <img
            src={imageSrc}
            alt="GradCAM Overlay Map"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div 
            onClick={() => setIsFullscreen(true)}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center cursor-pointer"
          >
            <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Expand GradCAM</span>
            </span>
          </div>
        </div>

        {/* Explainability Info Footer */}
        <div className="w-full mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-start space-x-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Warm highlighted zones (red/yellow) indicate the key plantar regions driving the AI model&apos;s classification decision.
            </p>
          </div>
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
              GradCAM Explainability Overlay (High Res)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Gradient-weighted class activation mapping highlighting CNN attention focus.
            </p>

            <div className="bg-black rounded-2xl p-4 flex items-center justify-center">
              <img
                src={imageSrc}
                alt="GradCAM Overlay Enlarged"
                className="w-full max-h-[400px] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
