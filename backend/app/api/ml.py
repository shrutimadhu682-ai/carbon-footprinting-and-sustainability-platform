import uuid
import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from ..database.connection import get_db
from ..database.models import DatasetRecord, ModelRun, PredictionRecord
from ..schemas.schemas import (
    MLTrainRequest, MLTrainResponse, MLModelMetrics,
    MLPredictRequest, MLPredictResponse,
    MLClusteringRequest, MLClusteringResponse
)
from ..ml.pipeline import MLPipelineService

router = APIRouter(prefix="/ml", tags=["Machine Learning Pipeline"])

@router.post("/train", response_model=MLTrainResponse)
def train_model(request: MLTrainRequest, db: Session = Depends(get_db)):
    """Trains a regression model on selected dataset with Scikit-learn pipelines."""
    rec = db.query(DatasetRecord).filter(DatasetRecord.id == request.dataset_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_path = Path(rec.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing on disk")

    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read dataset: {str(e)}")

    try:
        eval_result = MLPipelineService.train_and_evaluate(
            df=df,
            target_column=request.target_column,
            feature_columns=request.feature_columns,
            algorithm=request.algorithm,
            test_size=request.test_size,
            split_strategy=request.split_strategy,
            date_column=request.date_column
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

    model_id = str(uuid.uuid4())
    pipeline = eval_result["pipeline"]
    artifact_path = MLPipelineService.save_model(model_id, pipeline)

    metrics_data = eval_result["metrics"]
    algo_label = request.algorithm.replace("_", " ").title()
    model_name = f"{algo_label} on {rec.original_name}"

    # Deactivate older models and set this as active
    db.query(ModelRun).update({"is_active": False})

    model_run = ModelRun(
        id=model_id,
        model_name=model_name,
        algorithm=request.algorithm,
        dataset_id=rec.id,
        target_column=request.target_column,
        feature_columns_json=json.dumps(request.feature_columns),
        metrics_json=json.dumps(metrics_data),
        artifact_path=artifact_path,
        is_active=True
    )
    db.add(model_run)
    db.commit()
    db.refresh(model_run)

    return MLTrainResponse(
        model_id=model_run.id,
        model_name=model_run.model_name,
        algorithm=model_run.algorithm,
        dataset_id=model_run.dataset_id,
        target_column=model_run.target_column,
        features=request.feature_columns,
        metrics=MLModelMetrics(**metrics_data),
        actual_vs_predicted=eval_result["actual_vs_predicted"],
        residuals=eval_result["residuals"],
        explanation=eval_result["explanation"]
    )

@router.get("/models", response_model=List[dict])
def list_models(db: Session = Depends(get_db)):
    """List trained machine learning model runs."""
    runs = db.query(ModelRun).order_by(ModelRun.created_at.desc()).all()
    results = []
    for r in runs:
        try:
            metrics = json.loads(r.metrics_json)
        except Exception:
            metrics = {}
        try:
            features = json.loads(r.feature_columns_json)
        except Exception:
            features = []
        results.append({
            "id": r.id,
            "model_name": r.model_name,
            "algorithm": r.algorithm,
            "dataset_id": r.dataset_id,
            "target_column": r.target_column,
            "features": features,
            "metrics": metrics,
            "is_active": r.is_active,
            "created_at": r.created_at
        })
    return results

@router.post("/predict", response_model=MLPredictResponse)
def predict_emissions(req: MLPredictRequest, db: Session = Depends(get_db)):
    """Predicts carbon emissions using trained pipeline on new feature input."""
    model_run = db.query(ModelRun).filter(ModelRun.id == req.model_id).first()
    if not model_run:
        raise HTTPException(status_code=404, detail="Model run not found")

    if not model_run.artifact_path or not Path(model_run.artifact_path).exists():
        raise HTTPException(status_code=400, detail="Trained model artifact file not found on disk")

    try:
        pred_value = MLPipelineService.predict_single(model_run.artifact_path, req.features)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed with input features: {str(e)}")

    pred_kg = round(float(pred_value), 2)
    pred_tonnes = round(pred_kg / 1000.0, 4)

    # Save prediction record
    pred_rec = PredictionRecord(
        model_id=model_run.id,
        model_name=model_run.model_name,
        dataset_id=model_run.dataset_id,
        input_features_json=json.dumps(req.features),
        predicted_emissions_kg_co2e=pred_kg,
        prediction_unit="kg CO2e",
        notes=f"Predicted using {model_run.algorithm}"
    )
    db.add(pred_rec)
    db.commit()
    db.refresh(pred_rec)

    limitations = [
        "Prediction is conditioned on feature distributions present in the training dataset.",
        "Operational factors not captured in features (e.g. extreme weather, driver behavior) may introduce variance.",
        "Model represents a statistical regression estimate, not a continuous direct sensor telemetry measurement."
    ]

    return MLPredictResponse(
        prediction_id=pred_rec.id,
        model_id=model_run.id,
        model_name=model_run.model_name,
        algorithm=model_run.algorithm,
        predicted_emissions_kg_co2e=pred_kg,
        predicted_emissions_tonnes_co2e=pred_tonnes,
        unit="kg CO2e",
        input_features=req.features,
        limitations=limitations,
        baseline_comparison={"reference": "Estimated standard", "variance_note": "Within expected regression bounds"}
    )

@router.post("/cluster", response_model=MLClusteringResponse)
def run_clustering_endpoint(req: MLClusteringRequest, db: Session = Depends(get_db)):
    """Runs K-Means clustering to discover operational archetypes."""
    rec = db.query(DatasetRecord).filter(DatasetRecord.id == req.dataset_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_path = Path(rec.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing on disk")

    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read dataset: {str(e)}")

    try:
        result = MLPipelineService.run_clustering(
            df=df,
            feature_columns=req.feature_columns,
            n_clusters=req.n_clusters
        )
        return MLClusteringResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clustering error: {str(e)}")
