# Carbon Footprinting & Sustainability Platform

An end-to-end full-stack web application designed to help individuals and organizations quantify, analyze, predict, and reduce greenhouse gas (GHG) emissions across electricity, transportation, stationary fuels, and facility operations.

Built as a BTech Project-Based Learning (PBL) project using React, FastAPI, Python, Pandas, and Scikit-learn.

## Project Overview

The platform provides:

- **Carbon Calculator:** Estimate emissions using activity data and emission factors.
- **Dashboard:** Explore emission KPIs and category-wise trends.
- **Emission Analytics:** Process uploaded datasets, inspect data quality, and analyze correlations.
- **Dataset Management:** Upload and audit CSV files.
- **ML Predictions:** Train regression models and evaluate prediction performance.
- **Recommendations:** Explore potential emission-reduction actions and what-if scenarios.
- **Reports:** View sustainability summaries and export data.
- **About:** Review the project workflow, objectives, and architecture.

## Technology Stack

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic
- Pandas and NumPy
- Scikit-learn
- SQLite and SQLAlchemy
- Pytest

## Project Structure

```text
carbonfootprinting/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── database/
│   │   ├── ml/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
├── data/
│   ├── demo_datasets/
│   └── sample_templates/
├── docs/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

## Local Installation

### Prerequisites
- Python installed
- Node.js and npm installed
- Git (optional)

### 1. Install backend dependencies

From the project root:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
```

### 2. Start the backend

```powershell
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

API documentation: http://127.0.0.1:8000/docs

### 3. Install and start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually http://localhost:5173.

## Emissions Calculation

The general calculation is:

**Emissions (kg CO₂e) = Activity Amount × Emission Factor**

Results depend on the activity data, units, and emission factors used. Check the selected factors and their sources before interpreting results.

## Machine Learning

The project includes a machine-learning pipeline intended to support emission prediction and analysis. Model performance should be assessed using appropriate held-out evaluation metrics, such as MAE, RMSE, and R², where applicable.

## Datasets

Example CSV datasets and a sample activity-data template are included in the `data/` directory. Review the dataset documentation before using the sample data for analysis.

## Testing

Run backend tests from the project root:

```powershell
python -m pytest backend/tests -v
```

Use the actual test results to confirm whether tests pass in your environment.

## Documentation

See the `docs/` directory for project architecture and workflow documentation.

## Disclaimer

This is an academic project. Emission estimates depend on the accuracy of activity data, units, and emission factors. Recommendations and scenario projections are estimates, not guarantees of emissions reductions.