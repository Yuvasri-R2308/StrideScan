"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Footprints } from "lucide-react";

interface AffectedRegionsCardProps {
  affectedRegions: string[];
  ulcerRiskLevel?: string;
}

export const AffectedRegionsCard: React.FC<AffectedRegionsCardProps> = ({
  affectedRegions,
  ulcerRiskLevel = "Moderate Risk",
}) => {
  const isElevated = ulcerRiskLevel !== "Low Risk";

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Footprints size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#0c1a2e" }}>Pressure Overload Zones</div>
          <div style={{ fontSize: 10, color: "#627d98" }}>Anatomical regions flagged by AI</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {affectedRegions && affectedRegions.length > 0 ? (
          affectedRegions.map((region, idx) => {
            const isNormal = region.toLowerCase().includes("normal") || !isElevated;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: isNormal ? "#f0fdf4" : "#fff1f2",
                  border: `1px solid ${isNormal ? "#a7f3d0" : "#fca5a5"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isNormal
                    ? <CheckCircle2 size={13} color="#10b981" />
                    : <AlertCircle  size={13} color="#ef4444" />
                  }
                  <span style={{ fontSize: 12, fontWeight: 600, color: isNormal ? "#065f46" : "#991b1b" }}>
                    {region}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: isNormal ? "#059669" : "#dc2626",
                  }}
                >
                  {isNormal ? "Normal" : "Elevated"}
                </span>
              </div>
            );
          })
        ) : (
          <div
            style={{
              padding: "12px",
              borderRadius: 10,
              background: "#f8faff",
              border: "1px solid #e2e8f0",
              fontSize: 12,
              color: "#627d98",
            }}
          >
            No regional pressure overload flagged.
          </div>
        )}
      </div>
    </div>
  );
};
