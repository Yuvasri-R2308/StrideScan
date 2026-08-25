"use client";

import React from "react";
import { ShieldCheck, HeartPulse } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Left */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            SS
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              StrideScan AI Healthcare Platform
            </p>
            <p className="text-[11px] text-slate-400">
              EfficientNetB0 Plantar Pressure Diagnostics MVP
            </p>
          </div>
        </div>

        {/* Center Disclaimer */}
        <div className="max-w-md text-[11px] text-slate-400 leading-normal flex items-center space-x-1.5 justify-center">
          <HeartPulse className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>
            For medical hackathon research evaluation. Not a substitute for professional clinical diagnosis.
          </span>
        </div>

        {/* Right Status */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>FastAPI AI Service Connected</span>
        </div>
      </div>
    </footer>
  );
};
