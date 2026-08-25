"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { UlcerRiskLevel } from "@/types/clinical";

interface UlcerRiskCardProps {
  ulcerRiskScore: number;
  ulcerRiskLevel: UlcerRiskLevel;
  confidence: number;
  summary: string;
}

const riskConfig = {
  "Low Risk": {
    stroke: "#10b981",
    trackStroke: "#d1fae5",
    icon: ShieldCheck,
    badgeClass: "badge badge-risk-low",
    cardBg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    border: "#a7f3d0",
    label: "Ulcer Risk",
    sublabel: "Within safe limits",
  },
  "Moderate Risk": {
    stroke: "#f59e0b",
    trackStroke: "#fef3c7",
    icon: AlertTriangle,
    badgeClass: "badge badge-risk-moderate",
    cardBg: "linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)",
    border: "#fcd34d",
    label: "Ulcer Risk",
    sublabel: "Elevated pressure detected",
  },
  "High Risk": {
    stroke: "#ef4444",
    trackStroke: "#fee2e2",
    icon: ShieldAlert,
    badgeClass: "badge badge-risk-high",
    cardBg: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
    border: "#fca5a5",
    label: "Ulcer Risk",
    sublabel: "Immediate clinical attention",
  },
};

export const UlcerRiskCard: React.FC<UlcerRiskCardProps> = ({
  ulcerRiskScore,
  ulcerRiskLevel,
  confidence,
  summary,
}) => {
  const cfg = riskConfig[ulcerRiskLevel] ?? riskConfig["Moderate Risk"];
  const IconComp = cfg.icon;

  // SVG ring parameters
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 48;
  const circ = 2 * Math.PI * r;
  const riskOffset = circ - (ulcerRiskScore / 100) * circ;
  const confOffset = circ - (confidence / 100) * circ;

  return (
    <div
      style={{
        background: cfg.cardBg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 20,
        padding: "24px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: cfg.stroke,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${cfg.stroke}44`,
            }}
          >
            <IconComp size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#627d98", textTransform: "uppercase" }}>
              Foot Ulcer Risk Assessment
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0c1a2e", lineHeight: 1.2 }}>
              {ulcerRiskLevel}
            </div>
          </div>
        </div>
        <span className={cfg.badgeClass} style={{ fontSize: 11, fontWeight: 700 }}>
          {ulcerRiskScore}%
        </span>
      </div>

      {/* Dual Gauge Row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {/* Ulcer Risk Gauge */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.75)",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.06)",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={cfg.trackStroke} strokeWidth={10} />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={cfg.stroke}
              strokeWidth={10}
              strokeDasharray={circ}
              strokeDashoffset={riskOffset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dashoffset 1.2s cubic-bezier(.34,1.56,.64,1)" }}
            />
            <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle" fontSize={24} fontWeight={800} fill="#0c1a2e">
              {ulcerRiskScore}
            </text>
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize={10} fontWeight={600} fill="#627d98">
              / 100
            </text>
          </svg>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#334e68" }}>Ulcer Risk Score</div>
            <div style={{ fontSize: 10, color: "#627d98" }}>{cfg.sublabel}</div>
          </div>
        </div>

        {/* AI Confidence Gauge */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.75)",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.06)",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0f2fe" strokeWidth={10} />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth={10}
              strokeDasharray={circ}
              strokeDashoffset={confOffset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dashoffset 1.2s cubic-bezier(.34,1.56,.64,1)" }}
            />
            <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle" fontSize={22} fontWeight={800} fill="#0c1a2e">
              {confidence.toFixed(0)}%
            </text>
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize={10} fontWeight={600} fill="#627d98">
              AI Score
            </text>
          </svg>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#334e68" }}>Model Confidence</div>
            <div style={{ fontSize: 10, color: "#627d98" }}>EfficientNetB0 + Fusion</div>
          </div>
        </div>
      </div>

      {/* Clinical Summary */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <Activity size={16} color="#0ea5e9" style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: "#334e68", lineHeight: 1.7, margin: 0 }}>
          {summary}
        </p>
      </div>
    </div>
  );
};
