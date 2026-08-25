"use client";

import React from "react";
import { 
  FileSpreadsheet, 
  Filter, 
  Flame, 
  Cpu, 
  Eye, 
  Activity, 
  Layers, 
  ShieldAlert, 
  MessageSquareText, 
  FileCheck2,
  ArrowRight,
  GitFork
} from "lucide-react";

export const WorkflowPipeline: React.FC = () => {
  const steps = [
    { title: "CSV / Excel Upload", desc: "8-Channel Sensor Sheet", icon: FileSpreadsheet, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { title: "Preprocessing", desc: "Filter, Impute & Normalise", icon: Filter, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { title: "Heatmap Generation", desc: "256x256 Plantar Contour", icon: Flame, color: "text-rose-600 bg-rose-50 border-rose-200" },
  ];

  const branchA = [
    { title: "EfficientNetB0 CNN", desc: "Transfer Learning Vision", icon: Cpu, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { title: "Grad-CAM Map", desc: "Visual Explainability", icon: Eye, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  ];

  const branchB = [
    { title: "Biomechanical Extraction", desc: "10 Anatomical Markers", icon: Activity, color: "text-teal-600 bg-teal-50 border-teal-200" },
    { title: "Feature Vector", desc: "Arch Index & Asymmetry", icon: GitFork, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  const finalSteps = [
    { title: "Hybrid Fusion Layer", desc: "Rule-Based CNN + Marker Fusion", icon: Layers, color: "text-sky-700 bg-sky-50 border-sky-200" },
    { title: "Clinical Risk Engine", desc: "4-Tier Risk Categorization", icon: ShieldAlert, color: "text-red-700 bg-red-50 border-red-200" },
    { title: "Explanation Engine", desc: "Deterministic Rule Synthesis", icon: MessageSquareText, color: "text-teal-700 bg-teal-50 border-teal-200" },
    { title: "Clinical Report", desc: "Hospital-Grade CDS Payload", icon: FileCheck2, color: "text-slate-900 bg-stone-100 border-stone-300" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
      
      {/* Top Sequential Phase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center space-x-3 p-3.5 rounded-xl border bg-stone-50/50 border-stone-200/80">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${step.color}`}>
              <step.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 0{idx + 1}</span>
              <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
              <p className="text-[11px] text-slate-500">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Parallel Branch Indicator Banner */}
      <div className="flex items-center justify-center space-x-3 py-1 bg-stone-100 rounded-lg border border-stone-200 text-xs font-bold text-slate-700">
        <GitFork className="w-4 h-4 text-teal-600" />
        <span>Parallel Processing Branches</span>
      </div>

      {/* Branch A & Branch B Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-stone-50/80 border border-stone-200">
        
        {/* Branch A: CNN */}
        <div className="space-y-3 p-4 rounded-lg bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Branch A: Deep Learning Vision</span>
          </div>
          <div className="space-y-2">
            {branchA.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/50 border border-purple-100 text-xs">
                <div className="flex items-center space-x-2">
                  <step.icon className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900">{step.title}</span>
                </div>
                <span className="text-[11px] text-purple-700">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Branch B: Biomechanical */}
        <div className="space-y-3 p-4 rounded-lg bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Branch B: Biomechanical Engineering</span>
          </div>
          <div className="space-y-2">
            {branchB.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-teal-50/50 border border-teal-100 text-xs">
                <div className="flex items-center space-x-2">
                  <step.icon className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-slate-900">{step.title}</span>
                </div>
                <span className="text-[11px] text-teal-700">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Final Convergence Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {finalSteps.map((step, idx) => (
          <div key={idx} className="p-3 rounded-xl border bg-stone-50/50 border-stone-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">STAGE {idx + 4}</span>
              <step.icon className="w-4 h-4 text-slate-700" />
            </div>
            <h5 className="text-xs font-bold text-slate-900">{step.title}</h5>
            <p className="text-[11px] text-slate-500 leading-tight">{step.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
};
