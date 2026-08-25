"use client";

import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface RecommendationsCardProps {
  recommendations: string[];
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  const isUrgent = (r: string) =>
    r.toLowerCase().includes("urgent") || r.toLowerCase().includes("immediate") || r.toLowerCase().includes("prescribe");

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle2 size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#627d98", textTransform: "uppercase" }}>
            Care Plan
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0c1a2e" }}>Clinical Recommendations</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {recommendations.map((rec, i) => {
          const urgent = isUrgent(rec);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: urgent ? "#fff7ed" : "#f0fdf4",
                border: `1px solid ${urgent ? "#fcd34d" : "#a7f3d0"}`,
              }}
            >
              {urgent
                ? <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                : <CheckCircle2  size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
              }
              <p style={{ fontSize: 12, color: "#334e68", lineHeight: 1.6, margin: 0 }}>
                {rec}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
