import os
import uuid
import json
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import pandas as pd

from ..database.connection import get_db
from ..database.models import DatasetRecord
from ..config import settings, DEMO_DATA_DIR, SAMPLE_TEMPLATE_DIR, UPLOADS_DIR
from ..schemas.schemas import DatasetSummary, DatasetPreviewResponse, ColumnMappingRequest, DataAnalysisResponse
from ..services.data_processor import DataProcessor

router = APIRouter(prefix="/datasets", tags=["Dataset Management"])

def ensure_demo_datasets_registered(db: Session):
    """Ensures demo datasets are indexed in the database."""
    demos = [
        {
            "filename": "enterprise_esg_operations.csv",
            "name": "Enterprise ESG Multi-Facility Operations (Demo)",
            "path": DEMO_DATA_DIR / "enterprise_esg_operations.csv"
        },
        {
            "filename": "fleet_transport_emissions.csv",
            "name": "Commercial Logistics Fleet Telematics (Demo)",
            "path": DEMO_DATA_DIR / "fleet_transport_emissions.csv"
        }
    ]
    for d in demos:
        if d["path"].exists():
            exists = db.query(DatasetRecord).filter(DatasetRecord.filename == d["filename"]).first()
            if not exists:
                try:
                    df = pd.read_csv(d["path"])
                    rec = DatasetRecord(
                        id=f"demo-{d['filename'].split('.')[0]}",
                        filename=d["filename"],
                        original_name=d["name"],
                        file_path=str(d["path"]),
                        row_count=len(df),
                        columns_json=json.dumps(df.columns.tolist()),
                        summary_json=json.dumps({"description": "Pre-loaded verified demo dataset"}),
                        status="ready",
                        is_demo=True
                    )
                    db.add(rec)
                    db.commit()
                except Exception:
                    db.rollback()

@router.get("", response_model=List[DatasetSummary])
def list_datasets(db: Session = Depends(get_db)):
    """List all available datasets (demo and user uploaded)."""
    ensure_demo_datasets_registered(db)
    records = db.query(DatasetRecord).order_by(DatasetRecord.is_demo.desc(), DatasetRecord.uploaded_at.desc()).all()
    results = []
    for r in records:
        cols = []
        try:
            cols = json.loads(r.columns_json)
        except Exception:
            pass
        results.append(DatasetSummary(
            id=r.id,
            filename=r.filename,
            original_name=r.original_name,
            row_count=r.row_count,
            columns=cols,
            status=r.status,
            is_demo=r.is_demo,
            uploaded_at=r.uploaded_at
        ))
    return results

@router.post("/upload", response_model=DatasetSummary)
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and validate a new CSV dataset."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV (.csv) files are supported.")

    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}_{file.filename}"
    target_path = UPLOADS_DIR / safe_name

    # Check size stream
    total_bytes = 0
    with open(target_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024): # 1MB chunks
            total_bytes += len(chunk)
            if total_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
                buffer.close()
                if target_path.exists():
                    target_path.unlink()
                raise HTTPException(status_code=400, detail="File exceeds maximum allowed size of 10 MB.")
            buffer.write(chunk)

    try:
        df = pd.read_csv(target_path)
    except Exception as e:
        if target_path.exists():
            target_path.unlink()
        raise HTTPException(status_code=400, detail=f"Invalid or corrupted CSV file: {str(e)}")

    if len(df) == 0:
        if target_path.exists():
            target_path.unlink()
        raise HTTPException(status_code=400, detail="Uploaded CSV file contains no data rows.")

    rec = DatasetRecord(
        id=file_id,
        filename=safe_name,
        original_name=file.filename,
        file_path=str(target_path),
        row_count=len(df),
        columns_json=json.dumps(df.columns.tolist()),
        summary_json=json.dumps({"size_bytes": total_bytes}),
        status="ready",
        is_demo=False
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return DatasetSummary(
        id=rec.id,
        filename=rec.filename,
        original_name=rec.original_name,
        row_count=rec.row_count,
        columns=df.columns.tolist(),
        status=rec.status,
        is_demo=rec.is_demo,
        uploaded_at=rec.uploaded_at
    )

@router.get("/{dataset_id}/preview", response_model=DatasetPreviewResponse)
def get_dataset_preview(dataset_id: str, max_rows: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """Preview dataset schema, missing values, duplicates, and column suggestions."""
    ensure_demo_datasets_registered(db)
    rec = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_path = Path(rec.file_path)
    try:
        preview = DataProcessor.inspect_and_preview(file_path, max_rows=max_rows)
        return DatasetPreviewResponse(
            id=rec.id,
            filename=rec.original_name,
            row_count=preview["row_count"],
            columns=preview["columns"],
            column_types=preview["column_types"],
            head_rows=preview["head_rows"],
            column_suggestions=preview["column_suggestions"],
            missing_summary=preview["missing_summary"],
            duplicate_count=preview["duplicate_count"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{dataset_id}/analyze", response_model=DataAnalysisResponse)
def analyze_dataset_endpoint(dataset_id: str, mapping: ColumnMappingRequest, db: Session = Depends(get_db)):
    """Run full 10-stage processing and statistical analytics on mapped dataset."""
    ensure_demo_datasets_registered(db)
    rec = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_path = Path(rec.file_path)
    try:
        results = DataProcessor.analyze_dataset(
            file_path=file_path,
            emissions_col=mapping.emissions_col,
            category_col=mapping.category_col,
            date_col=mapping.date_col,
            department_col=mapping.department_col,
            activity_col=mapping.activity_col
        )
        return DataAnalysisResponse(
            dataset_id=rec.id,
            total_records=results["total_records"],
            duplicate_records=results["duplicate_records"],
            missing_values=results["missing_values"],
            total_emissions_kg=results["total_emissions_kg"],
            total_emissions_tonnes=results["total_emissions_tonnes"],
            mean_emissions_kg=results["mean_emissions_kg"],
            median_emissions_kg=results["median_emissions_kg"],
            std_emissions_kg=results["std_emissions_kg"],
            min_emissions_kg=results["min_emissions_kg"],
            max_emissions_kg=results["max_emissions_kg"],
            category_breakdown=results["category_breakdown"],
            department_breakdown=results["department_breakdown"],
            timeline_breakdown=results["timeline_breakdown"],
            correlations=results["correlations"],
            potential_outliers_count=results["potential_outliers_count"],
            data_quality_score=results["data_quality_score"],
            quality_notes=results["quality_notes"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis failed: {str(e)}")

@router.get("/template/download")
def download_sample_template():
    """Download standardized blank carbon activity CSV template."""
    template_path = SAMPLE_TEMPLATE_DIR / "carbon_activity_template.csv"
    if not template_path.exists():
        raise HTTPException(status_code=404, detail="Template file not found")
    return FileResponse(
        path=template_path,
        media_type="text/csv",
        filename="carbon_activity_template.csv"
    )

@router.get("/{dataset_id}/export-clean")
def export_clean_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Export cleaned dataset without duplicates or corrupted rows."""
    ensure_demo_datasets_registered(db)
    rec = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_path = Path(rec.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing on disk")

    df = pd.read_csv(file_path)
    df_clean = df.drop_duplicates()
    csv_str = df_clean.to_csv(index=False)

    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=cleaned_{rec.filename}"}
    )
