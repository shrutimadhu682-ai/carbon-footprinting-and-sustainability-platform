import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text
from .connection import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class DatasetRecord(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    row_count = Column(Integer, default=0)
    columns_json = Column(Text, default="[]")
    summary_json = Column(Text, default="{}")
    status = Column(String(50), default="ready")
    is_demo = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=get_utc_now)

class CalculationRecord(Base):
    __tablename__ = "calculations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category = Column(String(100), nullable=False)
    activity_type = Column(String(150), nullable=False)
    activity_amount = Column(Float, nullable=False)
    activity_unit = Column(String(50), nullable=False)
    emission_factor = Column(Float, nullable=False)
    emission_factor_unit = Column(String(50), nullable=False)
    emissions_kg_co2e = Column(Float, nullable=False)
    emissions_tonnes_co2e = Column(Float, nullable=False)
    region = Column(String(100), default="Global")
    source_notes = Column(Text, default="")
    created_at = Column(DateTime, default=get_utc_now)

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_id = Column(String(36), nullable=False)
    model_name = Column(String(100), nullable=False)
    dataset_id = Column(String(36), nullable=True)
    input_features_json = Column(Text, nullable=False)
    predicted_emissions_kg_co2e = Column(Float, nullable=False)
    prediction_unit = Column(String(50), default="kg CO2e")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=get_utc_now)

class ModelRun(Base):
    __tablename__ = "model_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_name = Column(String(100), nullable=False)
    algorithm = Column(String(100), nullable=False)
    dataset_id = Column(String(36), nullable=False)
    target_column = Column(String(100), nullable=False)
    feature_columns_json = Column(Text, nullable=False)
    metrics_json = Column(Text, nullable=False)
    artifact_path = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

class ActionPlan(Base):
    __tablename__ = "action_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recommendation_id = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    potential_impact = Column(String(100), default="High")
    status = Column(String(50), default="evaluating")
    target_date = Column(String(50), default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=get_utc_now)
