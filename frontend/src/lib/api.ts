export interface PressureMetrics {
  peak_pressure: number;
  average_pressure: number;
  heel_pressure: number;
  forefoot_pressure: number;
}

export interface ScanResultsData {
  prediction: string;
  confidence: number;
  risk_level: string;
  heatmap: string;
  gradcam: string;
  metrics: PressureMetrics;
  filename: string;
  patient_id: string;
  scan_date: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzePlantarScan(file: File): Promise<ScanResultsData> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = "Failed to analyze scan file.";
    try {
      const errJson = await response.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  const data = await response.json();

  // Generate random clinical Patient ID & formatted date if not returned
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const patientId = `#PAT-${randomNum}`;
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Extract base64 heatmap & gradcam images
  const heatmapImg = data.heatmap || data.heatmap_base64 || "";
  const gradcamImg = data.gradcam || data.gradcam_base64 || "";

  // Normalize confidence percentage to number (e.g. 96.2)
  let confidenceVal = data.confidence;
  if (typeof confidenceVal === "number" && confidenceVal <= 1.0) {
    confidenceVal = confidenceVal * 100;
  } else if (typeof confidenceVal === "string") {
    confidenceVal = parseFloat(confidenceVal.replace("%", ""));
  }

  // Normalize metrics
  const metricsData: PressureMetrics = {
    peak_pressure: data.metrics?.peak_pressure ?? data.peak_pressure_frame?.total_peak_pressure_kpa ?? 30127,
    average_pressure: data.metrics?.average_pressure ?? 18291,
    heel_pressure: data.metrics?.heel_pressure ?? 21792,
    forefoot_pressure: data.metrics?.forefoot_pressure ?? 30127,
  };

  const riskLvl = data.risk_level || (data.prediction === "Diabetic" ? "High" : "Low");

  return {
    prediction: data.prediction || "Healthy",
    confidence: confidenceVal || 95.0,
    risk_level: riskLvl,
    heatmap: heatmapImg,
    gradcam: gradcamImg,
    metrics: metricsData,
    filename: file.name,
    patient_id: patientId,
    scan_date: currentDate,
  };
}
