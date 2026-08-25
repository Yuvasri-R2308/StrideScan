# StrideScan – AI-Based Diabetic Foot Ulcer Risk Assessment

StrideScan is an AI-powered clinical decision support system for **early diabetic foot ulcer risk assessment** using plantar pressure data. Users upload a plantar pressure CSV/Excel file, and the system generates a pressure heatmap, analyzes biomechanical features, predicts ulcer risk, and provides explainable AI visualizations with clinical recommendations.

---

## Features

- Upload plantar pressure CSV/Excel files
- Generate plantar pressure heatmaps
- Automatic biomechanical feature extraction
- AI-powered ulcer risk prediction (Low / Moderate / High)
- Grad-CAM explainability
- Clinical recommendations
- Downloadable clinical report

---

## Workflow

```text
Upload CSV/Excel
        ↓
Data Preprocessing
        ↓
Heatmap Generation
        ↓
Feature Extraction
        ↓
Ulcer Risk Prediction
        ↓
Grad-CAM Visualization
        ↓
Clinical Report
```

---

## Tech Stack


| Category | Technologies |
|----------|--------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python |
| **AI / Machine Learning** | TensorFlow, EfficientNetB0, Grad-CAM |
| **Computer Vision** | OpenCV |
| **Data Processing** | NumPy, Pandas, SciPy |
| **Visualization** | Matplotlib, Recharts |
| **Input Format** | CSV, Excel (.csv, .xlsx, .xls) |
| **Report Generation** | PDF Export |


---

## Project Structure

```text
StrideScan/
├── backend/
├── frontend/
├── model/
├── training/
├── dataset/
└── README.md
```

---

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict-ulcer-risk` | Predict diabetic foot ulcer risk |
| GET | `/docs` | FastAPI Swagger documentation |

---

## Output

The system provides:

- Ulcer Risk Score
- Risk Level
- Pressure Heatmap
- Grad-CAM Visualization
- Pressure Analytics
- Clinical Recommendations

---

## Disclaimer

StrideScan is intended for research, educational, and screening purposes only. It is **not** a substitute for professional medical diagnosis.