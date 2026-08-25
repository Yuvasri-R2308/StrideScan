"use client";

import React from "react";
import { Cpu, Sparkles } from "lucide-react";

interface GradCAMViewerProps {
  gradcamBase64: string;
}

export const GradCAMViewer: React.FC<GradCAMViewerProps> = ({ gradcamBase64 }) => {
  return (
    <div className="card" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cpu size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0c1a2e" }}>Grad-CAM Explainability Map</div>
            <div style={{ fontSize: 10, color: "#627d98" }}>EfficientNetB0 attention overlay</div>
          </div>
        </div>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 700,
            background: "#f5f3ff",
            color: "#6d28d9",
            border: "1px solid #ddd6fe",
          }}
        >
          XAI
        </span>
      </div>

      {/* Image Box */}
      <div
        style={{
          position: "relative",
          aspectRatio: "1/1",
          borderRadius: 12,
          background: "#0a0a0a",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {gradcamBase64 ? (
          <img
            src={gradcamBase64.startsWith("data:") ? gradcamBase64 : `data:image/png;base64,${gradcamBase64}`}
            alt="Grad-CAM Explainability Overlay"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#7c3aed", opacity: 0.5 }}>
            <Cpu size={32} style={{ margin: "0 auto 8px" }} />
            <div style={{ fontSize: 11 }}>Grad-CAM unavailable</div>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "3px 8px",
            borderRadius: 6,
            background: "rgba(10,10,10,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            border: "1px solid rgba(124,58,237,0.35)",
          }}
        >
          <Sparkles size={10} color="#a78bfa" />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#c4b5fd" }}>Ulcer Risk Attention</span>
        </div>
      </div>

      {/* Caption */}
      <p style={{ fontSize: 11, color: "#627d98", marginTop: 10, lineHeight: 1.5 }}>
        Red/warm regions show areas the AI model focused on to assess plantar pressure concentration and ulcer risk.
      </p>
    </div>
  );
};
