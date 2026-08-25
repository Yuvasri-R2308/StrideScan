"use client";

import React from "react";
import { Loader2, Footprints, Cpu, Activity } from "lucide-react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto my-12 text-center animate-in fade-in duration-300">
      <div className="card-apple p-10 flex flex-col items-center justify-center space-y-6">
        {/* Animated Icon Ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 animate-pulse-ring">
            <Footprints className="w-10 h-10 stroke-[2]" />
          </div>
          <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-md">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Analyzing Plantar Pressure...
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Processing 8-channel sensor time-series data and generating EfficientNet explainability maps.
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="w-full space-y-2.5 pt-2 text-left text-xs font-semibold">
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100/60 text-blue-800">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-blue-600 animate-bounce" />
              <span>1. Extracting Peak Pressure Frame</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-blue-200">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 opacity-85">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-4 h-4 text-slate-400" />
              <span>2. Interpolating 256x256 Plantar Heatmap</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Pending</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 opacity-85">
            <div className="flex items-center space-x-2.5">
              <Footprints className="w-4 h-4 text-slate-400" />
              <span>3. EfficientNet CNN Classifier & Grad-CAM</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};
