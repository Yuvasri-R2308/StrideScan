"use client";

import React from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, Award } from "lucide-react";

interface PredictionCardProps {
  prediction: string;
  confidence: number;
  riskLevel: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  confidence,
  riskLevel,
}) => {
  const isDiabetic = prediction.toLowerCase() === "diabetic";

  return (
    <div className="card-apple p-6 sm:p-7 relative overflow-hidden transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Award className="w-4 h-4 text-blue-600" />
          <span>AI Diagnostic Classification</span>
        </div>
        
        {/* Large Colored Risk Badge */}
        <span
          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-xs ${
            isDiabetic
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {isDiabetic ? (
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>{riskLevel} Risk</span>
        </span>
      </div>

      {/* Main Prediction Display */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">
            Predicted Condition
          </span>
          <h3
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isDiabetic ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {prediction}
          </h3>
        </div>

        {/* Confidence Percentage Badge */}
        <div className="text-right">
          <span className="text-xs font-medium text-slate-400 block mb-1">
            Confidence Score
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {confidence.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-500">
          <span>Model Certainty</span>
          <span className="font-semibold text-slate-700">{confidence.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDiabetic ? "bg-red-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(Math.max(confidence, 5), 100)}%` }}
          />
        </div>
      </div>

      {/* Clinical Guidance Note */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          {isDiabetic
            ? "High pressure asymmetry detected across plantar regions. Further clinical neuropathy and vascular screening recommended."
            : "Plantar pressure distribution displays healthy load dispersion across metatarsals and heel regions."}
        </p>
      </div>
    </div>
  );
};
