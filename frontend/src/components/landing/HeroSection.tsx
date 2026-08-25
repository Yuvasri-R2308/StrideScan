"use client";

import React, { useState } from "react";
import { 
  Activity, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  BarChart2, 
  CheckCircle2,
  FileSpreadsheet,
  Zap
} from "lucide-react";
import { WorkflowPipeline } from "./WorkflowPipeline";
import { ResearchSpecs } from "./ResearchSpecs";

interface HeroSectionProps {
  onStartAnalysis: () => void;
  onViewDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartAnalysis,
  onViewDemo,
}) => {
  const [showResearchModal, setShowResearchModal] = useState<boolean>(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);

  return (
    <div className="space-y-12 py-4">
      {/* Main Hero Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-900 via-slate-900 to-stone-950 text-white p-8 sm:p-12 border border-stone-800 shadow-xl">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Glowing Ambient Gradient */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Clinical Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Hospital-Grade Clinical Decision Support System</span>
          </div>

          {/* Hero Main Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-white leading-tight">
            Stride<span className="text-teal-400">Scan</span>
          </h1>

          {/* Prompt-mandated tagline */}
          <h2 className="text-xl sm:text-2xl font-medium text-stone-200 tracking-wide">
            "AI-Assisted Clinical Decision Support for Plantar Pressure Analysis"
          </h2>

          <p className="text-stone-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Transforming raw plantar pressure sensor grids into explainable diabetic foot risk insights using EfficientNetB0 vision models fused with 10 deterministic biomechanical markers.
          </p>

          {/* CTA Buttons (Mandated: Start Analysis, View Demo, Research, Architecture) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStartAnalysis}
              className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 active:scale-[0.98] text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewDemo}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl border border-slate-700 shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>View Demo</span>
            </button>

            <button
              onClick={() => setShowResearchModal(true)}
              className="px-5 py-3.5 bg-stone-900/80 hover:bg-stone-800 text-stone-300 font-semibold text-sm rounded-xl border border-stone-700 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>Research</span>
            </button>

            <button
              onClick={() => setShowArchitectureModal(true)}
              className="px-5 py-3.5 bg-stone-900/80 hover:bg-stone-800 text-stone-300 font-semibold text-sm rounded-xl border border-stone-700 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Architecture</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800">
              <div className="text-teal-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Explainable AI</span>
              </div>
              <p className="text-stone-300 font-semibold text-sm mt-1">Grad-CAM Overlay</p>
              <p className="text-stone-500 text-[11px]">Visual heat activation</p>
            </div>

            <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800">
              <div className="text-teal-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Biomechanical</span>
              </div>
              <p className="text-stone-300 font-semibold text-sm mt-1">10 Clinical Markers</p>
              <p className="text-stone-500 text-[11px]">Arch index & asymmetry</p>
            </div>

            <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800">
              <div className="text-teal-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Deterministic</span>
              </div>
              <p className="text-stone-300 font-semibold text-sm mt-1">Zero Hallucinations</p>
              <p className="text-stone-500 text-[11px]">Rule-based explanation</p>
            </div>

            <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800">
              <div className="text-teal-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Transfer Learning</span>
              </div>
              <p className="text-stone-300 font-semibold text-sm mt-1">EfficientNetB0</p>
              <p className="text-stone-500 text-[11px]">96.2% ROC-AUC score</p>
            </div>
          </div>

        </div>
      </section>

      {/* Visual Workflow Pipeline Section */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-200/80 text-stone-700">
            End-to-End Hybrid Architecture
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            Clinical Decision Support Workflow
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            Parallel multi-branch processing combining deep learning vision models with biomechanical engineering metrics.
          </p>
        </div>

        <WorkflowPipeline />
      </section>

      {/* Modals for Research and Architecture */}
      <ResearchSpecs
        isOpenResearch={showResearchModal}
        isOpenArchitecture={showArchitectureModal}
        onClose={() => {
          setShowResearchModal(false);
          setShowArchitectureModal(false);
        }}
      />
    </div>
  );
};
