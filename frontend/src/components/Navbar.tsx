"use client";

import React from "react";
import { Activity, ShieldCheck, Footprints } from "lucide-react";

interface NavbarProps {
  onReset?: () => void;
  hasResults?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset, hasResults }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div 
          onClick={onReset}
          className={`flex items-center space-x-3 ${hasResults ? "cursor-pointer group" : ""}`}
        >
          <div className="w-10 h-10 rounded-[12px] bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Footprints className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                StrideScan
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                v1.0 MVP
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 hidden sm:block">
              AI-Powered Plantar Pressure Analysis
            </p>
          </div>
        </div>

        {/* Center Subtitle for larger screens */}
        <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
          <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Clinical Decision Support System</span>
        </div>

        {/* Right Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Backend Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
