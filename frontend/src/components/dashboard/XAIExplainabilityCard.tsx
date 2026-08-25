"use client";

import React from "react";
import { Brain, Tag, MapPin } from "lucide-react";
import { ClinicalExplanation, BiomechanicalFeatures } from "@/types/clinical";

interface XAIExplainabilityCardProps {
  explanation: ClinicalExplanation;
  features: BiomechanicalFeatures;
}

export const XAIExplainabilityCard: React.FC<XAIExplainabilityCardProps> = ({
  explanation,
  features,
}) => {
  const tags = explanation.highlight_tags ?? [];
  const affectedRegions = explanation.affected_regions ?? [];

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#627d98", textTransform: "uppercase" }}>
            Explainable AI
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0c1a2e" }}>Model Attention Analysis</div>
        </div>
      </div>

      {/* AI Attention Summary */}
      {explanation.ai_attention_summary && (
        <div
          className="card-inset"
          style={{ padding: 14, marginBottom: 16, borderLeft: "3px solid #7c3aed" }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#5b21b6", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Grad-CAM Attention Summary
          </div>
          <p style={{ fontSize: 12, color: "#334e68", lineHeight: 1.7, margin: 0 }}>
            {explanation.ai_attention_summary}
          </p>
        </div>
      )}

      {/* AI Highlight Tags */}
      {tags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Tag size={13} color="#0ea5e9" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#334e68", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Pressure Hotspot Tags
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  background: i === 0 ? "#eff6ff" : "#f5f3ff",
                  color: i === 0 ? "#1d4ed8" : "#6d28d9",
                  border: `1px solid ${i === 0 ? "#bfdbfe" : "#ddd6fe"}`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Affected Regions */}
      {affectedRegions.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <MapPin size={13} color="#0ea5e9" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#334e68", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Flagged Anatomical Regions
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {affectedRegions.map((region, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#fff7ed",
                  color: "#92400e",
                  border: "1px solid #fcd34d",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                {region}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Possible Reason */}
      {explanation.possible_reason && (
        <div className="card-inset" style={{ padding: 14, marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#334e68", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Biomechanical Contributing Factors
          </div>
          <p style={{ fontSize: 12, color: "#334e68", lineHeight: 1.7, margin: 0 }}>
            {explanation.possible_reason}
          </p>
        </div>
      )}
    </div>
  );
};
