"use client";

import React from "react";
import { XAIExplainabilityCard } from "./XAIExplainabilityCard";
import { ClinicalExplanation, BiomechanicalFeatures } from "@/types/clinical";

interface ExplainabilityCardProps {
  explanation: ClinicalExplanation;
  features: BiomechanicalFeatures;
  prediction?: string;
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({ explanation, features }) => {
  return <XAIExplainabilityCard explanation={explanation} features={features} />;
};
