"use client";

import React from "react";
import { ShieldCheck, Activity, Cpu, Layers } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 text-xs border-t border-stone-800 py-8 px-4 sm:px-6 lg:px-8 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
        
        {/* Col 1 */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center space-x-2 text-white">
            <Activity className="w-5 h-5 text-teal-400" />
            <span className="text-base font-extrabold tracking-tight">StrideScan AI</span>
          </div>
          <p className="text-stone-400 text-xs leading-relaxed">
            Explainable AI Clinical Decision Support System for plantar pressure analysis, biomechanical feature extraction, and early diabetic foot ulcer risk stratification.
          </p>
        </div>

        {/* Col 2 */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Clinical Architecture</h4>
          <ul className="space-y-1.5 text-stone-400">
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>EfficientNetB0 Deep CNN Classifier</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>10-Point Biomechanical Feature Extractor</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Grad-CAM Explainability Map Generator</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Hybrid Deterministic Risk Engine</span>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Standards & Compliance</h4>
          <ul className="space-y-1.5 text-stone-400">
            <li className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>IWGDF Diabetic Foot Risk Framework</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cavanagh & Rodgers Arch Index Standard</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero LLM Hallucination Guarantee</span>
            </li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Clinical Disclaimer</h4>
          <p className="text-stone-400 text-[11px] leading-normal bg-stone-800/80 p-3 rounded-lg border border-stone-700">
            StrideScan is designed to assist healthcare professionals in risk stratification. All predictions and explanations should be evaluated alongside comprehensive podiatric clinical examination.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400">
        <p>© 2026 StrideScan Clinical AI. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Healthcare Product Design Specification | Version 2.0.0</p>
      </div>
    </footer>
  );
};
