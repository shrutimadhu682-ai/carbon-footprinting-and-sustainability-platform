import json
from pathlib import Path
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
import pandas as pd

from ..database.connection import get_db
from ..database.models import DatasetRecord, ModelRun, CalculationRecord
from .dashboard import get_dashboard_summary

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("/summary")
def get_report_summary(
    dataset_id: Optional[str] = Query(None),
    period: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Compiles comprehensive executive ESG sustainability report data."""
    dashboard_data = get_dashboard_summary(dataset_id=dataset_id, period_filter=period, db=db)
    
    # Check if ML model is available
    active_model = db.query(ModelRun).filter(ModelRun.is_active == True).order_by(ModelRun.created_at.desc()).first()
    model_summary = None
    if active_model:
        try:
            metrics = json.loads(active_model.metrics_json)
            features = json.loads(active_model.feature_columns_json)
            model_summary = {
                "model_name": active_model.model_name,
                "algorithm": active_model.algorithm,
                "target_column": active_model.target_column,
                "features": features,
                "metrics": metrics,
                "trained_at": active_model.created_at.isoformat()
            }
        except Exception:
            pass

    return {
        "report_title": "Executive Carbon Footprint & Sustainability Performance Report",
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "reporting_period": period if period and period != "All" else "Full Available Horizon (FY 2024)",
        "unit": "kg CO2e & tonnes CO2e",
        "kpis": dashboard_data.kpis,
        "category_emissions": dashboard_data.category_emissions,
        "category_percentages": dashboard_data.category_percentages,
        "emissions_over_time": dashboard_data.emissions_over_time,
        "department_comparison": dashboard_data.department_comparison,
        "ml_model_evaluation": model_summary,
        "methodology": "GHG Protocol Corporate Standard (Scope 1, Scope 2, Scope 3 activities). Verified regional emission factors from CEA, DEFRA, and US EPA.",
        "disclaimer": "This report synthesizes observed activity data. Projections and simulations are clearly identified as estimates."
    }

@router.get("/export-csv")
def export_report_csv(dataset_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Exports raw records of the active dataset or calculations as CSV."""
    rec = None
    if dataset_id:
        rec = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
    if not rec:
        rec = db.query(DatasetRecord).filter(DatasetRecord.filename == "enterprise_esg_operations.csv").first()

    if rec and Path(rec.file_path).exists():
        df = pd.read_csv(rec.file_path)
        csv_str = df.to_csv(index=False)
        filename = f"report_data_{rec.filename}"
    else:
        # Fallback to calculation records
        calcs = db.query(CalculationRecord).all()
        df = pd.DataFrame([{
            "Category": c.category,
            "Activity": c.activity_type,
            "Amount": c.activity_amount,
            "Unit": c.activity_unit,
            "Factor": c.emission_factor,
            "Emissions_kgCO2e": c.emissions_kg_co2e,
            "Date": c.created_at.isoformat()
        } for c in calcs])
        csv_str = df.to_csv(index=False)
        filename = "report_calculations.csv"

    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
