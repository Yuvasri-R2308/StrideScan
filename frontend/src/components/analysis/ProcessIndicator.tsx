"use client";

import React, { useEffect, useState } from "react";
import { 
  Upload, 
  Filter, 
  Flame, 
  Cpu, 
  Activity, 
  Layers, 
  ShieldAlert, 
  MessageSquareText, 
  FileCheck2,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface ProcessIndicatorProps {
  currentStage?: number;
}

const STAGES = [
  { id: 1, name: "Upload", desc: "Ingesting pressure matrix file", icon: Upload },
  { id: 2, name: "Preprocessing", desc: "Missing value imputation & noise filtering", icon: Filter },
  { id: 3, name: "Heatmap", desc: "Generating 256x256 plantar contour image", icon: Flame },
  { id: 4, name: "Deep Learning", desc: "EfficientNetB0 CNN classification & Grad-CAM", icon: Cpu },
  { id: 5, name: "Biomechanical Features", desc: "Extracting 10 anatomical pressure markers", icon: Activity },
  { id: 6, name: "Hybrid Fusion", desc: "Blending CNN confidence & marker rules", icon: Layers },
  { id: 7, name: "Clinical Risk", desc: "Stratifying into 4-tier clinical risk category", icon: ShieldAlert },
  { id: 8, name: "Explainability", desc: "Synthesizing rule-based clinical explanation", icon: MessageSquareText },
  { id: 9, name: "Clinical Report", desc: "Assembling hospital-ready decision payload", icon: FileCheck2 },
];

export const ProcessIndicator: React.FC<ProcessIndicatorProps> = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STAGES.length ? prev + 1 : prev));
    }, 450); // Animated progress progression

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 border border-stone-200 shadow-md space-y-8 animate-in fade-in duration-300">
      
      {/* Loading Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
          <span>Processing Plantar Pressure Pipeline</span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900">Clinical AI Execution</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Executing parallel deep learning inference and biomechanical marker calculation...
        </p>
      </div>

      {/* Progress Bar Header */}
      <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
        <div 
          className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${(activeStep / STAGES.length) * 100}%` }}
        />
      </div>

      {/* Pipeline Stages Vertical List */}
      <div className="space-y-3">
        {STAGES.map((stage) => {
          const isDone = activeStep > stage.id;
          const isCurrent = activeStep === stage.id;
          const isPending = activeStep < stage.id;

          const IconComponent = stage.icon;

          return (
            <div
              key={stage.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-250 ${
                isCurrent
                  ? "bg-teal-50/90 border-teal-300 shadow-sm"
                  : isDone
                  ? "bg-stone-50 border-stone-200 opacity-90"
                  : "bg-white border-stone-100 opacity-50"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border text-xs font-bold ${
                    isDone
                      ? "bg-teal-600 text-white border-teal-700"
                      : isCurrent
                      ? "bg-teal-500 text-white border-teal-600 animate-pulse"
                      : "bg-stone-100 text-slate-400 border-stone-200"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{stage.name}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                        Active Stage
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{stage.desc}</p>
                </div>
              </div>

              <div className="text-xs font-semibold">
                {isDone && <span className="text-emerald-700 font-bold text-[11px]">Completed</span>}
                {isCurrent && <span className="text-teal-700 font-bold text-[11px]">Processing...</span>}
                {isPending && <span className="text-stone-400 text-[11px]">Queued</span>}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
