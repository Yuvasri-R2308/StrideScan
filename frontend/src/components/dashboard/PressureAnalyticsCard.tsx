"use client";

import React from "react";
import { BarChart3, TrendingUp, Footprints, Activity, Scale } from "lucide-react";
import { BiomechanicalFeatures } from "@/types/clinical";

interface PressureAnalyticsCardProps {
  features: BiomechanicalFeatures;
}

interface MetricRowProps {
  label: string;
  value: string;
  status: "normal" | "caution" | "alert" | "info";
  bar?: number; // 0-100
  barColor?: string;
  delay?: number;
}

const statusColors = {
  normal:  { dot: "#10b981", text: "#065f46" },
  caution: { dot: "#f59e0b", text: "#78350f" },
  alert:   { dot: "#ef4444", text: "#991b1b" },
  info:    { dot: "#0ea5e9", text: "#075985" },
};

const MetricRow: React.FC<MetricRowProps> = ({ label, value, status, bar, barColor, delay = 0 }) => {
  const col = statusColors[status];
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: bar !== undefined ? 6 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="dot" style={{ background: col.dot }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "#334e68" }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: col.text }}>{value}</span>
      </div>
      {bar !== undefined && (
        <div style={{ height: 5, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              background: barColor ?? col.dot,
              width: `${bar}%`,
              transition: `width 0.9s cubic-bezier(.34,1.56,.64,1) ${delay}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export const PressureAnalyticsCard: React.FC<PressureAnalyticsCardProps> = ({ features }) => {
  const peak = features.peak_plantar_pressure_kpa ?? 0;
  const mean = features.mean_plantar_pressure_kpa ?? 0;
  const ff   = (features.forefoot_pressure_ratio ?? 0) * 100;
  const mid  = (features.midfoot_pressure_ratio ?? 0) * 100;
  const heel = (features.heel_pressure_ratio ?? 0) * 100;
  const asym = (features.mediolateral_asymmetry_score ?? 0) * 100;
  const ai   = features.arch_index;
  const area = features.contact_area_proxy ?? 0;

  const peakStatus = peak > 700 ? "alert" : peak > 500 ? "caution" : "normal";
  const asymStatus = asym > 30 ? "alert" : asym > 20 ? "caution" : "normal";
  const ffStatus   = ff > 65 ? "alert" : ff > 55 ? "caution" : "normal";

  const archLabel = ai === null || ai === undefined
    ? "N/A"
    : ai < 0.20
    ? `${ai.toFixed(3)} — Pes Cavus`
    : ai > 0.35
    ? `${ai.toFixed(3)} — Pes Planus`
    : `${ai.toFixed(3)} — Normal`;

  const archStatus = ai === null || ai === undefined
    ? "info"
    : ai < 0.20 || ai > 0.35
    ? "caution"
    : "normal";

  const peakBar = Math.min(100, (peak / 1000) * 100);
  const ffBar   = Math.min(100, ff);
  const midBar  = Math.min(100, mid);
  const heelBar = Math.min(100, heel);

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BarChart3 size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#627d98", textTransform: "uppercase" }}>
            Biomechanical Analysis
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0c1a2e" }}>Pressure Analytics</div>
        </div>
      </div>

      {/* Peak Pressure Section */}
      <div className="card-inset" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <TrendingUp size={14} color="#0ea5e9" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#334e68", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Peak Pressure Metrics
          </span>
        </div>
        <MetricRow label="Peak Plantar Pressure" value={`${peak.toFixed(1)} kPa`} status={peakStatus} bar={peakBar} barColor={peakStatus === "alert" ? "#ef4444" : peakStatus === "caution" ? "#f59e0b" : "#10b981"} delay={0} />
        <MetricRow label="Mean Plantar Pressure" value={`${mean.toFixed(1)} kPa`} status="info" bar={Math.min(100, (mean / 800) * 100)} barColor="#0ea5e9" delay={80} />
        <MetricRow label="Highest Pressure Region" value={features.highest_pressure_region ?? "Forefoot"} status={peakStatus} />
      </div>

      {/* Zone Distribution Section */}
      <div className="card-inset" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Footprints size={14} color="#0ea5e9" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#334e68", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Zone Distribution
          </span>
        </div>
        <MetricRow label="Forefoot Load" value={`${ff.toFixed(1)}%`} status={ffStatus} bar={ffBar} barColor={ffStatus === "alert" ? "#ef4444" : ffStatus === "caution" ? "#f59e0b" : "#10b981"} delay={0} />
        <MetricRow label="Midfoot Load"  value={`${mid.toFixed(1)}%`}  status="info"   bar={midBar}  barColor="#0ea5e9" delay={60} />
        <MetricRow label="Heel Load"     value={`${heel.toFixed(1)}%`} status="normal" bar={heelBar} barColor="#10b981" delay={120} />
      </div>

      {/* Structural & Symmetry Section */}
      <div className="card-inset" style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Scale size={14} color="#0ea5e9" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#334e68", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Structural Analysis
          </span>
        </div>
        <MetricRow label="Mediolateral Asymmetry" value={`${asym.toFixed(1)}%`} status={asymStatus} bar={Math.min(100, asym * 2)} barColor={asymStatus === "alert" ? "#ef4444" : asymStatus === "caution" ? "#f59e0b" : "#10b981"} delay={0} />
        <MetricRow label="Arch Index" value={archLabel} status={archStatus} />
        <MetricRow label="Contact Area (proxy)" value={`${area.toFixed(0)} units`} status="info" />
        <MetricRow label="Distribution Status" value={features.pressure_distribution_status ?? "—"} status={features.pressure_distribution_status?.includes("High") ? "caution" : "normal"} />
        <MetricRow label="Symmetry Status" value={features.pressure_symmetry_status ?? "—"} status={features.pressure_symmetry_status?.includes("Imbalance") ? "caution" : "normal"} />
      </div>
    </div>
  );
};
