"use client";

import React from "react";
import { UlcerRiskCard } from "./UlcerRiskCard";
import { UlcerRiskLevel } from "@/types/clinical";

interface ClinicalRiskCardProps {
  prediction?: string;
  confidence: number;
  riskLevel: string;
  summary: string;
}

export const ClinicalRiskCard: React.FC<ClinicalRiskCardProps> = ({
  confidence,
  riskLevel,
  summary,
}) => {
  const level: UlcerRiskLevel = riskLevel.includes("High") ? "High Risk" : riskLevel.includes("Moderate") ? "Moderate Risk" : "Low Risk";
  const score = level === "High Risk" ? 78 : level === "Moderate Risk" ? 52 : 20;

  return (
    <UlcerRiskCard
      ulcerRiskScore={score}
      ulcerRiskLevel={level}
      confidence={confidence}
      summary={summary}
    />
  );
};
