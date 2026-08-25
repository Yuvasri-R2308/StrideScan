"use client";

import React from "react";
import { PressureAnalyticsCard } from "./PressureAnalyticsCard";
import { BiomechanicalFeatures } from "@/types/clinical";

interface BiomechanicalMetricsCardProps {
  features: BiomechanicalFeatures;
}

export const BiomechanicalMetricsCard: React.FC<BiomechanicalMetricsCardProps> = ({ features }) => {
  return <PressureAnalyticsCard features={features} />;
};
