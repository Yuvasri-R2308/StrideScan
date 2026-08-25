// types/clinical.ts — StrideScan Ulcer Risk Assessment Platform

export type UlcerRiskLevel = "Low Risk" | "Moderate Risk" | "High Risk";

export interface PressureCentroid {
  x: number;
  y: number;
}

export interface RegionalPressure {
  region: "Toes" | "Forefoot" | "Midfoot" | "Heel" | string;
  total_kpa: number;
  mean_kpa: number;
  relative_fraction: number;
  sensor_count: number;
}

export interface PressureAnalytics {
  peak_pressure_kpa: number;
  mean_pressure_kpa: number;
  pressure_variance_kpa2?: number;
  highest_pressure_region: string;
  contact_area_cm2: number;
  pressure_distribution_status: string;
  pressure_symmetry_status: string;
  forefoot_to_heel_ratio: number;
  forefoot_pressure_kpa: number;
  midfoot_pressure_kpa: number;
  heel_pressure_kpa: number;
}

export interface BiomechanicalFeatures {
  // Core pressure metrics
  peak_plantar_pressure_kpa: number;
  mean_plantar_pressure_kpa: number;
  highest_pressure_region?: string;
  contact_area_proxy: number;
  contact_area_status?: string;
  pressure_distribution_status?: string;
  pressure_symmetry_status?: string;
  forefoot_to_heel_ratio?: number;
  forefoot_pressure_kpa?: number;
  midfoot_pressure_kpa?: number;
  heel_pressure_kpa?: number;

  // PTI
  pressure_time_integral_kpa_s?: number | null;
  pressure_time_integral_note?: string | null;

  // Arch & loading
  arch_index?: number | null;
  mediolateral_asymmetry_score: number;

  // Zone ratios
  forefoot_pressure_ratio: number;
  midfoot_pressure_ratio: number;
  heel_pressure_ratio: number;

  // Spatial
  pressure_centroid: PressureCentroid;
  regional_distribution: RegionalPressure[];
  peak_frame_sensor_values: Record<string, number>;
}

export interface ClinicalExplanation {
  summary: string;
  findings: string[];
  affected_regions: string[];
  possible_reason: string;
  recommendations: string[];
  ai_attention_summary?: string;
  highlight_tags?: string[];
}

export interface ReportMetadata {
  processing_time_ms: number;
  model_version: string;
  pipeline_version: string;
  timestamp: string;
  sensor_count: number;
  temporal_data_available: boolean;
}

export interface UlcerRiskReport {
  status?: string;
  filename: string;
  ulcer_risk_score: number;         // 0-100 (the central metric shown to user)
  ulcer_risk_level: UlcerRiskLevel;
  confidence: number;               // model confidence 0-100
  pressure_analytics?: PressureAnalytics;
  biomechanical_features: BiomechanicalFeatures;
  gradcam: string;
  heatmap: string;
  findings: ClinicalExplanation;
  recommendations: string[];
  metadata: ReportMetadata;
  // Patient session info
  scan_id?: string;
  scan_date?: string;
}
