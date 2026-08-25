"use client";

import React from "react";
import { X, BookOpen, Layers, CheckCircle2, ShieldCheck, FileCode, Cpu, BarChart2 } from "lucide-react";

interface ResearchSpecsProps {
  isOpenResearch: boolean;
  isOpenArchitecture: boolean;
  onClose: () => void;
}

export const ResearchSpecs: React.FC<ResearchSpecsProps> = ({
  isOpenResearch,
  isOpenArchitecture,
  onClose,
}) => {
  if (!isOpenResearch && !isOpenArchitecture) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in fade-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal 1: Research Specifications */}
        {isOpenResearch && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 text-teal-800 border-b border-stone-200 pb-4">
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
                <BookOpen className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Clinical Research & Validation</h3>
                <p className="text-xs text-slate-500">Biomechanical foundation & clinical literature standards</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>1. Cavanagh & Rodgers Arch Index Standard (1987)</span>
                </h4>
                <p>
                  Arch Index (AI) = midfoot_pressure / (forefoot + midfoot + heel). Thresholds: AI &lt; 0.21 indicates pes cavus (high arch); AI &gt; 0.26 indicates pes planus (flat foot). Used in StrideScan to detect structural arch collapse.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>2. Bus et al. Elevated Plantar Pressure Threshold (2016)</span>
                </h4>
                <p>
                  Peak plantar pressure &gt; 700 kPa is recognized as a high-risk marker for neuropathic ulceration in diabetic foot management. StrideScan triggers automatic risk elevation when sensor readings cross 500 kPa and 700 kPa.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>3. Explainable AI via Grad-CAM (Selvaraju et al., 2017)</span>
                </h4>
                <p>
                  Gradient-weighted Class Activation Mapping extracts spatial attention heatmaps from the final convolutional layer of EfficientNetB0, highlighting metatarsal head regions contributing to Diabetic classification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: System Architecture */}
        {isOpenArchitecture && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 text-blue-800 border-b border-stone-200 pb-4">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <Layers className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Backend System Architecture</h3>
                <p className="text-xs text-slate-500">SOLID modular services & FastAPI v2 pipeline design</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>backend/preprocess.py</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Missing value imputation, median spike noise filtering, per-column normalization, time column detection.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                    <BarChart2 className="w-4 h-4 text-teal-600" />
                    <span>services/feature_extraction.py</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Extracts 10 biomechanical markers: Peak/Mean pressure, Arch Index, Mediolateral Asymmetry, PTI, Centroid, Zone ratios.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span>services/fusion.py</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Combines CNN classification score with 5 deterministic biomechanical rules for calibrated risk scoring.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>services/explainer.py</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Synthesizes findings, affected regions, possible pathology reasons, and podiatric recommendations without LLM hallucinations.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
