"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { PatientAnalysis } from "@/components/analysis/PatientAnalysis";
import { ProcessIndicator } from "@/components/analysis/ProcessIndicator";
import { ResultsDashboard } from "@/components/dashboard/ResultsDashboard";
import { PrintableClinicalReport } from "@/components/report/PrintableClinicalReport";
import { analyzeUlcerRisk } from "@/services/api";
import { UlcerRiskReport } from "@/types/clinical";

type ActiveTab = "landing" | "analysis" | "results" | "report";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("landing");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<UlcerRiskReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setActiveTab("analysis");

    try {
      const data = await analyzeUlcerRisk(file);
      setResults(data);
      setIsLoading(false);
      setActiveTab("results");
    } catch (err: any) {
      setError(err.message || "Failed to analyze plantar pressure scan. Ensure the StrideScan backend is running on port 8000.");
      setIsLoading(false);
      setActiveTab("analysis");
    }
  };

  const handleViewDemo = () => {
    setError(null);
    // Clinically realistic sample payload — all ulcer-risk framing
    const sampleResults: UlcerRiskReport = {
      status: "success",
      filename: "patient_scan_PLR-2042.xlsx",
      ulcer_risk_score: 78,
      ulcer_risk_level: "High Risk",
      confidence: 91.4,
      heatmap: "",
      gradcam: "",
      biomechanical_features: {
        peak_plantar_pressure_kpa: 675.5,
        mean_plantar_pressure_kpa: 420.8,
        highest_pressure_region: "2nd–3rd Metatarsal Heads",
        contact_area_proxy: 155.0,
        contact_area_status: "Reduced",
        pressure_distribution_status: "High Forefoot Loading",
        pressure_symmetry_status: "Moderate Imbalance",
        forefoot_to_heel_ratio: 5.9,
        pressure_time_integral_kpa_s: null,
        pressure_time_integral_note: "Temporal time-series column absent in scan file.",
        arch_index: 0.125,
        mediolateral_asymmetry_score: 0.185,
        forefoot_pressure_ratio: 0.748,
        midfoot_pressure_ratio: 0.125,
        heel_pressure_ratio: 0.127,
        pressure_centroid: { x: 0.528, y: 0.399 },
        regional_distribution: [
          { region: "Forefoot", total_kpa: 3692.3, mean_kpa: 615.4, relative_fraction: 0.748, sensor_count: 6 },
          { region: "Midfoot",  total_kpa: 617.0,  mean_kpa: 617.0, relative_fraction: 0.125, sensor_count: 1 },
          { region: "Heel",     total_kpa: 627.6,  mean_kpa: 627.6, relative_fraction: 0.127, sensor_count: 1 },
        ],
        peak_frame_sensor_values: {
          "MTK1.P": 573.1, "MTK2.P": 666.1, "MTK3.P": 613.4,
          "MTK4.P": 528.7, "MTK5.P": 675.5, "D1.P": 635.6,
          "L.P": 617.0,    "C.P": 627.6,
        },
      },
      findings: {
        summary: "Plantar pressure analysis indicates High Risk for diabetic foot ulceration. Peak pressure of 675.5 kPa detected beneath the 2nd–3rd metatarsal heads, significantly exceeding the 500 kPa moderate-risk threshold.",
        findings: [
          "Elevated peak plantar pressure (675.5 kPa) exceeds the 500 kPa moderate-risk threshold.",
          "Arch Index (0.125) indicates pes cavus (high-arched foot) — concentrates load on forefoot and heel.",
          "Forefoot carries 74.8% of total plantar load — metatarsal head overloading pattern detected.",
          "Mediolateral loading asymmetry (18.5%) indicates moderate pronation/supination imbalance.",
        ],
        affected_regions: ["2nd–3rd Metatarsal Heads", "Hallux (D1)", "Lateral Forefoot"],
        possible_reason: "The plantar pressure distribution demonstrates elevated loading beneath the 2nd–3rd metatarsal heads. Contributing factors include: high-arched foot morphology (pes cavus) concentrating load on forefoot; significant forefoot-dominant gait pattern. Such pressure concentration is associated with increased biomechanical stress and may contribute to future ulcer formation.",
        recommendations: [
          "Schedule urgent podiatric evaluation within 1–2 weeks.",
          "Prescribe total-contact casting or therapeutic offloading footwear immediately.",
          "Perform regular foot inspection for callus formation, redness, or skin breakdown.",
          "Use pressure off-loading footwear or custom orthotic insoles.",
          "Repeat plantar pressure screening in 2–4 weeks post-intervention.",
        ],
        ai_attention_summary: "The model focused primarily on the 2nd–3rd metatarsal head region because it exhibited the highest pressure concentration (peak 675.5 kPa) and an abnormal forefoot-dominant loading pattern associated with elevated ulcer risk.",
        highlight_tags: ["High Pressure Zone", "Critical Loading Area", "Pressure Hotspots"],
      },
      recommendations: [
        "Schedule urgent podiatric evaluation within 1–2 weeks.",
        "Prescribe total-contact casting or therapeutic offloading footwear immediately.",
        "Perform regular foot inspection for callus formation, redness, or skin breakdown.",
        "Use pressure off-loading footwear or custom orthotic insoles.",
        "Repeat plantar pressure screening in 2–4 weeks post-intervention.",
        "Involve multidisciplinary diabetic foot care team.",
      ],
      metadata: {
        processing_time_ms: 312.4,
        model_version: "2.0.0",
        pipeline_version: "2.0.0",
        timestamp: new Date().toISOString(),
        sensor_count: 8,
        temporal_data_available: false,
      },
      scan_id: "SCN-84921",
      scan_date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setResults(sampleResults);
    setActiveTab("results");
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setActiveTab("analysis");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasResults={!!results}
        onReset={handleReset}
        onOpenDemo={handleViewDemo}
      />

      <main style={{ flex: 1, maxWidth: 1400, width: "100%", margin: "0 auto", padding: "32px 24px" }}>

        {/* TAB 1: LANDING */}
        {activeTab === "landing" && (
          <HeroSection
            onStartAnalysis={() => setActiveTab("analysis")}
            onViewDemo={handleViewDemo}
          />
        )}

        {/* TAB 2: ANALYSIS / LOADING */}
        {activeTab === "analysis" && (
          isLoading ? (
            <ProcessIndicator />
          ) : (
            <PatientAnalysis
              onAnalyze={handleAnalyze}
              onViewDemo={handleViewDemo}
              isLoading={isLoading}
              error={error}
            />
          )
        )}

        {/* TAB 3: RESULTS DASHBOARD */}
        {activeTab === "results" && results && (
          <ResultsDashboard
            results={results}
            onReset={handleReset}
            onOpenReport={() => setActiveTab("report")}
          />
        )}

        {/* TAB 4: PRINTABLE REPORT */}
        {activeTab === "report" && results && (
          <PrintableClinicalReport
            results={results}
            onClose={() => setActiveTab("results")}
          />
        )}

      </main>

      <Footer />
    </div>
  );
}
