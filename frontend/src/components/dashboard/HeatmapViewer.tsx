"use client";

import React, { useState } from "react";
import { Flame, Eye } from "lucide-react";

interface HeatmapViewerProps {
  heatmapBase64: string;
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ heatmapBase64 }) => {
  const [showROI, setShowROI] = useState(true);

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
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flame size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0c1a2e" }}>Plantar Pressure Heatmap</div>
            <div style={{ fontSize: 10, color: "#627d98" }}>Cubic-interpolated sensor spatial field</div>
          </div>
        </div>
        <button
          onClick={() => setShowROI(!showROI)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 8,
            border: `1px solid ${showROI ? "#fca5a5" : "#e2e8f0"}`,
            background: showROI ? "#fff1f2" : "#f8faff",
            color: showROI ? "#dc2626" : "#627d98",
            fontSize: 10,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Eye size={11} />
          {showROI ? "ROI ON" : "ROI OFF"}
        </button>
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
        {heatmapBase64 ? (
          <img
            src={heatmapBase64.startsWith("data:") ? heatmapBase64 : `data:image/png;base64,${heatmapBase64}`}
            alt="Plantar Pressure Heatmap"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#4a5568" }}>
            <Flame size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
            <div style={{ fontSize: 11 }}>Heatmap unavailable</div>
          </div>
        )}

        {/* ROI Overlay */}
        {showROI && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {["Hallux (D1)", "MTK1–5"].map((l) => (
                <span key={l} style={{ background: "rgba(10,10,10,0.7)", color: "rgba(255,255,255,0.85)", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)" }}>
                  {l}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {["Medial Arch", "Lateral Midfoot (L.P)"].map((l) => (
                <span key={l} style={{ background: "rgba(10,10,10,0.7)", color: "rgba(255,255,255,0.85)", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)" }}>
                  {l}
                </span>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ background: "rgba(10,10,10,0.7)", color: "rgba(255,255,255,0.85)", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)" }}>
                Calcaneus / Heel (C.P)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Pressure Scale Legend */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: "#627d98" }}>0 kPa</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: "#627d98" }}>350 kPa</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: "#dc2626" }}>&gt;700 kPa — Risk Zone</span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 99,
            background: "linear-gradient(90deg, #1d4ed8, #10b981, #fbbf24, #ef4444)",
            border: "1px solid #e2e8f0",
          }}
        />
      </div>
    </div>
  );
};
