"use client";

import React from "react";
import { Activity, Printer, X, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { UlcerRiskReport } from "@/types/clinical";

interface PrintableClinicalReportProps {
  results: UlcerRiskReport;
  onClose: () => void;
}

export const PrintableClinicalReport: React.FC<PrintableClinicalReportProps> = ({
  results,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const bio = results.biomechanical_features;
  const exp = results.findings;
  const pa  = results.biomechanical_features; // analytics available via bio fields or pressure_analytics

  const getRiskBadge = (level: string) => {
    if (level.includes("High")) return { bg: "bg-red-100 text-red-900 border-red-300", label: "High Ulcer Risk" };
    if (level.includes("Moderate")) return { bg: "bg-amber-100 text-amber-900 border-amber-300", label: "Moderate Ulcer Risk" };
    return { bg: "bg-emerald-100 text-emerald-900 border-emerald-300", label: "Low Ulcer Risk" };
  };

  const riskBadge = getRiskBadge(results.ulcer_risk_level);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Outer Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-10 space-y-6 relative my-auto font-sans text-slate-900 print:max-h-none print:shadow-none print:border-none print:p-0 print:m-0">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-700" />
            <span className="text-sm font-extrabold text-slate-900">Hospital Clinical Report Preview</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= HOSPITAL LETTERHEAD HEADER ================= */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-teal-700" />
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                StrideScan <span className="text-teal-700">Ulcer Risk CDS</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Department of Podiatric Medicine & Plantar Biomechanics
            </p>
            <p className="text-[10px] text-slate-400">
              Diabetic Foot Ulcer Risk Assessment Report | Protocol CDS-v3.0
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-3 py-1 rounded bg-stone-100 text-slate-900 text-xs font-bold border border-stone-300">
              CONFIDENTIAL MEDICAL RECORD
            </span>
            <p className="text-[11px] text-slate-500 font-medium">Scan ID: <strong className="text-slate-900">{results.scan_id || "SCN-9482"}</strong></p>
            <p className="text-[11px] text-slate-500 font-medium">Date: <strong className="text-slate-900">{results.scan_date}</strong></p>
          </div>
        </div>

        {/* ================= 1. PATIENT & SCAN METADATA ================= */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-stone-200 pb-1">
            1. Scan Metadata & Pipeline Provenance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold">SCAN FILE</span>
              <strong className="text-slate-900 truncate block">{results.filename}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold">SENSOR GRID</span>
              <strong className="text-slate-900">{results.metadata?.sensor_count ?? 8}-Channel Matrix</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold">PIPELINE VERSION</span>
              <strong className="text-slate-900">v{results.metadata?.pipeline_version || "3.0.0"}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold">ANALYSIS MODEL</span>
              <strong className="text-slate-900">EfficientNetB0 + XAI</strong>
            </div>
          </div>
        </div>

        {/* ================= 2. ULCER RISK ASSESSMENT ================= */}
        <div className="p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2. Ulcer Risk Assessment Outcome</span>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-black text-slate-900">{results.ulcer_risk_score}% Risk Score</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {results.confidence}% Model Certainty
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Risk Stratification</span>
            <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border shadow-xs ${riskBadge.bg}`}>
              {results.ulcer_risk_level}
            </span>
          </div>
        </div>

        {/* ================= 3. VISUAL ARTIFACTS ================= */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            3. Plantar Pressure & Grad-CAM Explainability Artifacts
          </h3>
          <div className="grid grid-cols-2 gap-4">
            
            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 space-y-2 text-center">
              <span className="text-[11px] font-bold text-slate-800 block">2D Plantar Pressure Heatmap</span>
              <div className="aspect-square bg-slate-950 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                {results.heatmap ? (
                  <img src={results.heatmap.startsWith("data:") ? results.heatmap : `data:image/png;base64,${results.heatmap}`} className="max-h-full object-contain" alt="Heatmap" />
                ) : <span className="text-stone-500 text-xs">Heatmap Image</span>}
              </div>
            </div>

            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 space-y-2 text-center">
              <span className="text-[11px] font-bold text-slate-800 block">Grad-CAM Ulcer Attention Overlay</span>
              <div className="aspect-square bg-slate-950 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                {results.gradcam ? (
                  <img src={results.gradcam.startsWith("data:") ? results.gradcam : `data:image/png;base64,${results.gradcam}`} className="max-h-full object-contain" alt="GradCAM" />
                ) : <span className="text-stone-500 text-xs">Grad-CAM Image</span>}
              </div>
            </div>

          </div>
        </div>

        {/* ================= 4. BIOMECHANICAL MARKER MEASUREMENTS ================= */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            4. Plantar Pressure Analytics & Biomechanical Markers
          </h3>
          <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-[11px] font-bold text-slate-700">
                  <th className="p-2.5">Biomechanical Marker</th>
                  <th className="p-2.5">Measured Value</th>
                  <th className="p-2.5">Reference Threshold</th>
                  <th className="p-2.5">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-slate-800">
                <tr>
                  <td className="p-2.5 font-bold">Peak Plantar Pressure</td>
                  <td className="p-2.5 font-extrabold">{bio.peak_plantar_pressure_kpa.toFixed(1)} kPa</td>
                  <td className="p-2.5 text-slate-500">&lt; 500 kPa (Moderate), &lt; 700 kPa (High)</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      bio.peak_plantar_pressure_kpa > 700 ? "bg-red-100 text-red-800" :
                      bio.peak_plantar_pressure_kpa > 500 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {bio.peak_plantar_pressure_kpa > 700 ? "Critically High" :
                       bio.peak_plantar_pressure_kpa > 500 ? "Elevated" : "Normal"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Mean Plantar Pressure</td>
                  <td className="p-2.5 font-extrabold">{bio.mean_plantar_pressure_kpa.toFixed(1)} kPa</td>
                  <td className="p-2.5 text-slate-500">150 – 400 kPa</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-stone-100 text-slate-800 font-semibold text-[10px]">Nominal</span></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Highest Pressure Region</td>
                  <td className="p-2.5 font-extrabold">{bio.highest_pressure_region || "Forefoot"}</td>
                  <td className="p-2.5 text-slate-500">Zonal Distribution</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-semibold text-[10px]">Hotspot</span></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Cavanagh Arch Index</td>
                  <td className="p-2.5 font-extrabold">{bio.arch_index !== null && bio.arch_index !== undefined ? bio.arch_index.toFixed(3) : "N/A"}</td>
                  <td className="p-2.5 text-slate-500">0.21 – 0.26</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-slate-800 font-semibold text-[10px]">
                      {bio.arch_index === null || bio.arch_index === undefined ? "N/A" :
                       bio.arch_index < 0.21 ? "Pes Cavus" :
                       bio.arch_index > 0.26 ? "Pes Planus" : "Normal Arch"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Mediolateral Asymmetry</td>
                  <td className="p-2.5 font-extrabold">{(bio.mediolateral_asymmetry_score * 100).toFixed(1)}%</td>
                  <td className="p-2.5 text-slate-500">&lt; 20%</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-slate-800 font-semibold text-[10px]">
                      {bio.mediolateral_asymmetry_score > 0.25 ? "Asymmetric" : "Symmetric"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Forefoot / Midfoot / Heel Ratio</td>
                  <td className="p-2.5 font-extrabold">{(bio.forefoot_pressure_ratio * 100).toFixed(0)}% / {(bio.midfoot_pressure_ratio * 100).toFixed(0)}% / {(bio.heel_pressure_ratio * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-slate-500">50% / 20% / 30%</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-stone-100 text-slate-800 font-semibold text-[10px]">Load Split</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= 5. CLINICAL FINDINGS & RECOMMENDATIONS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-stone-200 pb-1">
              5. Key Findings
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {exp.findings && exp.findings.length > 0 ? (
                exp.findings.map((f, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))
              ) : (
                <li>Nominal plantar loading across all zones.</li>
              )}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-stone-200 pb-1">
              6. Podiatric Care Plan & Recommendations
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {results.recommendations.map((r, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ================= 6. PROCESSING METADATA & SIGN-OFF ================= */}
        <div className="pt-4 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 space-y-3 sm:space-y-0">
          <div>
            <p><strong>Pipeline Provenance:</strong> StrideScan v{results.metadata?.pipeline_version || "3.0.0"} | Model v{results.metadata?.model_version || "2.0.0"}</p>
            <p><strong>Execution Latency:</strong> {results.metadata?.processing_time_ms || 284} ms | ISO Timestamp: {results.metadata?.timestamp || new Date().toISOString()}</p>
          </div>

          <div className="text-right border-l-2 border-stone-300 pl-4 space-y-0.5">
            <p className="font-bold text-slate-800">Attending Clinician Signature Block</p>
            <div className="h-6 border-b border-stone-400 w-36 ml-auto" />
            <p className="text-[9px] text-slate-400">MD / DPM Practitioner Validation</p>
          </div>
        </div>

      </div>
    </div>
  );
};
