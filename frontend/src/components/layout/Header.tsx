"use client";

import React from "react";
import { Activity, Shield, FileText, Upload, Sparkles, HelpCircle, Layers, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  activeTab: "landing" | "analysis" | "results" | "report";
  setActiveTab: (tab: "landing" | "analysis" | "results" | "report") => void;
  hasResults: boolean;
  onReset: () => void;
  onOpenDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasResults,
  onReset,
  onOpenDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("landing")}>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-700">
            <Activity className="w-5 h-5 text-teal-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
                Stride<span className="text-teal-700">Scan</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60 uppercase tracking-wider">
                Clinical CDS v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Explainable AI Plantar Decision Support System
            </p>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "landing"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-stone-100"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === "analysis"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-stone-100"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Patient Analysis</span>
          </button>

          {hasResults && (
            <button
              onClick={() => setActiveTab("results")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "results"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Results Dashboard</span>
            </button>
          )}

          {hasResults && (
            <button
              onClick={() => setActiveTab("report")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "report"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-stone-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Clinical Report</span>
            </button>
          )}
        </nav>

        {/* Right Status Pill & Demo Launcher */}
        <div className="hidden md:flex items-center space-x-3">
          {onOpenDemo && !hasResults && (
            <button
              onClick={onOpenDemo}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 transition-all flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Clinical Demo</span>
            </button>
          )}

          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>CDS Pipeline Ready</span>
          </div>
        </div>

      </div>
    </header>
  );
};
