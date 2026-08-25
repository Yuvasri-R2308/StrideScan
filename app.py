"""
backend/app.py

StrideScan FastAPI Application — Diabetic Foot Ulcer Risk Assessment Platform.

Endpoints:
  GET  /                       — Health check
  POST /predict-ulcer-risk     — Primary ulcer risk assessment endpoint
  POST /api/v2/analyze         — Alias for /predict-ulcer-risk (backward compatible)
  GET  /api/v2/health          — Pipeline health check

All Healthy/Diabetic binary classification endpoints have been removed.
This application is exclusively centred around early diabetic foot ulcer
risk assessment using plantar pressure sensor data.
"""

import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.routers.inference import router as ulcer_risk_router

app = FastAPI(
    title="StrideScan — Diabetic Foot Ulcer Risk Assessment API",
    description=(
        "AI-powered early diabetic foot ulcer risk assessment using plantar pressure sensor data.\n\n"
        "**Primary endpoint:** `POST /predict-ulcer-risk` — upload a plantar pressure CSV or Excel "
        "file to receive a complete Ulcer Risk Report including:\n"
        "- Ulcer risk score (0–100) and risk level (Low / Moderate / High)\n"
        "- Plantar pressure heatmap (base64 PNG)\n"
        "- Grad-CAM explainability overlay\n"
        "- Biomechanical feature extraction (peak pressure, arch index, zone ratios, etc.)\n"
        "- Structured clinical findings and recommendations\n\n"
        "**Supported file formats:** `.xlsx`, `.xls`, `.csv`\n"
        "**Required columns:** `MTK1.P`, `MTK2.P`, `MTK3.P`, `MTK4.P`, `MTK5.P`, `D1.P`, `L.P`, `C.P`"
    ),
    version="3.0.0",
    contact={
        "name": "StrideScan Clinical AI",
    },
    license_info={
        "name": "Research Use Only",
    },
)

# ---------------------------------------------------------------------------
# CORS — allow all origins (restrict in production)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Mount the ulcer risk assessment router
# ---------------------------------------------------------------------------
app.include_router(ulcer_risk_router)


# ---------------------------------------------------------------------------
# Root health check
# ---------------------------------------------------------------------------

@app.get("/", summary="API Health Check", tags=["Health"])
def read_root():
    """
    Root health check endpoint.
    Returns current API status and available endpoints.
    """
    return {
        "status":      "online",
        "service":     "StrideScan Diabetic Foot Ulcer Risk Assessment API",
        "version":     "3.0.0",
        "description": (
            "Upload a plantar pressure CSV/Excel file to POST /predict-ulcer-risk "
            "to receive a complete Diabetic Foot Ulcer Risk Assessment report."
        ),
        "endpoints": {
            "ulcer_risk_assessment": "POST /predict-ulcer-risk",
            "ulcer_risk_alias":      "POST /api/v2/analyze",
            "pipeline_health":       "GET /api/v2/health",
            "api_docs":              "GET /docs",
            "openapi_schema":        "GET /openapi.json",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
