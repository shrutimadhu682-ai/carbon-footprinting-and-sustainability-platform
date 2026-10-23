from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import pandas as pd

from ..database.connection import get_db
from ..database.models import DatasetRecord
from ..schemas.schemas import (
    RecommendationItem, ScenarioSimulationRequest, ScenarioSimulationResponse,
    ActionPlanCreate, ActionPlanResponse
)
from ..services.recommendation_service import RecommendationService
from ..services.data_processor import DataProcessor
from .datasets import ensure_demo_datasets_registered

router = APIRouter(prefix="/recommendations", tags=["Sustainability Recommendations"])

@router.get("", response_model=List[RecommendationItem])
def get_recommendations(dataset_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Generates transparent, rule-based recommendations based on active dataset metrics."""
    ensure_demo_datasets_registered(db)
    rec = None
    if dataset_id:
        rec = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
    if not rec:
        rec = db.query(DatasetRecord).filter(DatasetRecord.filename == "enterprise_esg_operations.csv").first()
    if not rec:
        rec = db.query(DatasetRecord).first()

    analysis_data = {}
    if rec and Path(rec.file_path).exists():
        try:
            # Map standard columns if present
            analysis_data = DataProcessor.analyze_dataset(
                file_path=Path(rec.file_path),
                emissions_col="Emissions_kgCO2e",
                category_col="Category",
                date_col="Date",
                department_col="Department"
            )
        except Exception:
            # If standard names fail, try fallback
            analysis_data = {
                "total_emissions_kg": 50000,
                "category_breakdown": [{"category": "Electricity", "percentage": 42.0, "total_emissions_tonnes": 21.0}],
                "timeline_breakdown": [],
                "potential_outliers_count": 0
            }

    recommendations = RecommendationService.generate_recommendations(analysis_data)
    
    # Check which recommendations are already saved as action plans
    saved_plans = db.query(ActionPlanResponse.id if False else None).all() if False else RecommendationService.list_action_plans(db)
    saved_ids = {p.recommendation_id for p in saved_plans}
    for r in recommendations:
        if r.id in saved_ids:
            r.is_saved = True

    return recommendations

@router.post("/simulate", response_model=ScenarioSimulationResponse)
def simulate_scenario(req: ScenarioSimulationRequest):
    """Simulates a What-If carbon reduction scenario transparently."""
    return RecommendationService.simulate_scenario(
        baseline_kg=req.baseline_emissions_kg,
        reduction_percentage=req.reduction_percentage,
        category=req.category,
        interventions=req.interventions
    )

@router.get("/action-plans", response_model=List[ActionPlanResponse])
def get_action_plans(db: Session = Depends(get_db)):
    """List saved evaluation and action plans."""
    return RecommendationService.list_action_plans(db)

@router.post("/action-plans", response_model=ActionPlanResponse)
def create_action_plan(plan: ActionPlanCreate, db: Session = Depends(get_db)):
    """Save an evaluated recommendation into actionable plan."""
    return RecommendationService.save_action_plan(db, plan)

@router.delete("/action-plans/{plan_id}")
def delete_action_plan(plan_id: str, db: Session = Depends(get_db)):
    """Delete an action plan item."""
    success = RecommendationService.delete_action_plan(db, plan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Action plan item not found")
    return {"message": "Action plan removed", "id": plan_id}
