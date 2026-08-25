"use client";

import React from "react";
import { ClipboardList, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ClinicalFindingsCardProps {
  findings: string[];
}

export const ClinicalFindingsCard: React.FC<ClinicalFindingsCardProps> = ({ findings }) => {
  if (!findings || findings.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2.5 border-b border-stone-100 pb-3">
        <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
          <ClipboardList className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Clinical Findings</h3>
          <p className="text-[10px] text-slate-500">Biomechanical marker evaluation</p>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-2.5">
        {findings.map((finding, i) => {
          const textLower = finding.toLowerCase();
          
          const isCritical =
            textLower.includes("critically") ||
            textLower.includes("exceeds the high-risk") ||
            textLower.includes("> 700");

          const isWarning =
            textLower.includes("elevated") ||
            textLower.includes("pes cavus") ||
            textLower.includes("pes planus") ||
            textLower.includes("overloading") ||
            textLower.includes("asymmetry") ||
            textLower.includes("imbalance") ||
            textLower.includes("dominant") ||
            textLower.includes("500");

          let bg = "bg-emerald-50/80 border-emerald-200 text-emerald-950";
          let Icon = CheckCircle2;
          let iconColor = "text-emerald-600";

          if (isCritical) {
            bg = "bg-rose-50/90 border-rose-200 text-rose-950";
            Icon = AlertCircle;
            iconColor = "text-rose-600";
          } else if (isWarning) {
            bg = "bg-amber-50/90 border-amber-200 text-amber-950";
            Icon = AlertTriangle;
            iconColor = "text-amber-600";
          }

          return (
            <div
              key={i}
              className={`p-3 rounded-xl border flex items-start space-x-2.5 text-xs leading-relaxed ${bg}`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
              <span>{finding}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
