from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database.connection import get_db
from ..schemas.schemas import CalculationInput, CalculationResponse, CalculationHistoryItem
from ..services.calculator_service import CalculatorService
from ..utils.emission_factors import EMISSION_REGISTRY, get_all_categories

router = APIRouter(prefix="/calculations", tags=["Carbon Calculator"])

@router.get("/categories")
def get_categories():
    """Returns available activity categories and full emission factor registry."""
    return {
        "categories": get_all_categories(),
        "registry": EMISSION_REGISTRY
    }

@router.post("", response_model=CalculationResponse)
def calculate_emissions(input_data: CalculationInput, db: Session = Depends(get_db)):
    """Calculate carbon emissions based on activity and emission factors, saving to SQLite."""
    try:
        return CalculatorService.calculate_and_save(db, input_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

@router.get("", response_model=dict)
def get_calculation_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve paginated calculation history."""
    records, total = CalculatorService.get_history(db, skip=skip, limit=limit, category=category)
    return {
        "items": [
            CalculationHistoryItem(
                id=r.id,
                category=r.category,
                activity_type=r.activity_type,
                activity_amount=r.activity_amount,
                activity_unit=r.activity_unit,
                emission_factor=r.emission_factor,
                emission_factor_unit=r.emission_factor_unit,
                emissions_kg_co2e=r.emissions_kg_co2e,
                emissions_tonnes_co2e=r.emissions_tonnes_co2e,
                region=r.region,
                source_notes=r.source_notes,
                created_at=r.created_at
            ) for r in records
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.delete("/{record_id}")
def delete_calculation(record_id: str, db: Session = Depends(get_db)):
    """Delete a calculation record."""
    success = CalculatorService.delete_record(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Calculation record not found")
    return {"message": "Calculation record successfully deleted", "id": record_id}

@router.get("/export/csv")
def export_calculations_csv(db: Session = Depends(get_db)):
    """Download calculation records as CSV."""
    csv_content = CalculatorService.export_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=carbon_calculations_export.csv"}
    )
