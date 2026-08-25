"use client";

import React from "react";
import { RefreshCw, FileText, Calendar, Hash, Clock, ShieldAlert } from "lucide-react";
import { UlcerRiskReport } from "@/types/clinical";
import { HeatmapViewer } from "./HeatmapViewer";
import { GradCAMViewer } from "./GradCAMViewer";
import { AffectedRegionsCard } from "./AffectedRegionsCard";
import { UlcerRiskCard } from "./UlcerRiskCard";
import { XAIExplainabilityCard } from "./XAIExplainabilityCard";
import { ClinicalFindingsCard } from "./ClinicalFindingsCard";
import { RecommendationsCard } from "./RecommendationsCard";
import { PressureAnalyticsCard } from "./PressureAnalyticsCard";
import { RegionalDistributionChart } from "./RegionalDistributionChart";

interface ResultsDashboardProps {
  results: UlcerRiskReport;
  onReset: () => void;
  onOpenReport: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  results,
  onReset,
  onOpenReport,
}) => {
  const processingMs = results.metadata?.processing_time_ms ?? 0;
  const processingLabel =
    processingMs > 1000
      ? `${(processingMs / 1000).toFixed(1)}s`
      : `${processingMs.toFixed(0)}ms`;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">

      {/* ─── Top Result Header Bar ─── */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ulcer Risk Assessment Dashboard
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Analysis Complete
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center space-x-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Scan ID: <strong className="text-slate-900">{results.scan_id || "SCN-9482"}</strong></span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date: <strong className="text-slate-900">{results.scan_date}</strong></span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Execution Latency: <strong className="text-slate-900">{processingLabel}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <button
            onClick={onOpenReport}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Print Clinical Report</span>
          </button>

          <button
            onClick={onReset}
            className="py-2.5 px-3.5 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl font-semibold border border-stone-200 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* ─── Centerpiece 3-Column Responsive Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">

        {/* LEFT COLUMN (4 Cols): Heatmap, Grad-CAM, Flagged Zones */}
        <div className="lg:col-span-4 space-y-6">
          <HeatmapViewer heatmapBase64={results.heatmap} />
          <GradCAMViewer gradcamBase64={results.gradcam} />
          <AffectedRegionsCard
            affectedRegions={results.findings.affected_regions}
            ulcerRiskLevel={results.ulcer_risk_level}
          />
        </div>

        {/* CENTER COLUMN (4 Cols): Ulcer Risk Card, Explainability, Findings, Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          <UlcerRiskCard
            ulcerRiskScore={results.ulcer_risk_score}
            ulcerRiskLevel={results.ulcer_risk_level}
            confidence={results.confidence}
            summary={results.findings.summary}
          />

          <XAIExplainabilityCard
            explanation={results.findings}
            features={results.biomechanical_features}
          />

          <ClinicalFindingsCard
            findings={results.findings.findings}
          />

          <RecommendationsCard
            recommendations={results.recommendations}
          />
        </div>

        {/* RIGHT COLUMN (4 Cols): Pressure Analytics, Regional Chart, Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <PressureAnalyticsCard features={results.biomechanical_features} />

          <RegionalDistributionChart
            regionalDistribution={results.biomechanical_features.regional_distribution}
          />

          {/* Scan Metadata Card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b border-stone-100 pb-2.5">
              <ShieldAlert className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pipeline Provenance
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500">Source File</span>
                <span className="font-bold text-slate-900 truncate max-w-[160px]">{results.filename}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500">CNN Model</span>
                <span className="font-semibold text-slate-800">EfficientNetB0 (v{results.metadata?.model_version || "2.0.0"})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500">Pipeline Protocol</span>
                <span className="font-semibold text-slate-800">Ulcer CDS v{results.metadata?.pipeline_version || "3.0.0"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500">Sensor Matrix</span>
                <span className="font-semibold text-slate-800">{results.metadata?.sensor_count || 8}-Channel Array</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Temporal Series</span>
                <span className="font-semibold text-slate-800">{results.metadata?.temporal_data_available ? "Available (PTI)" : "Single Stance Frame"}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
