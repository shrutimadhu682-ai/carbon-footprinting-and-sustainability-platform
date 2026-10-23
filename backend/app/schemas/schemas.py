from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

# Calculation Schemas
class CalculationInput(BaseModel):
    category: str = Field(..., description="Emission category: electricity, transportation, fuel, operations")
    subcategory: str = Field(..., description="Specific subcategory or activity key")
    activity_amount: float = Field(..., gt=0, description="Amount of activity, must be strictly positive")
    custom_factor: Optional[float] = Field(None, ge=0, description="Optional custom emission factor override")
    region: Optional[str] = Field("Global", description="Regional context")
    notes: Optional[str] = Field("", description="Optional notes or context")

    @field_validator("activity_amount")
    @classmethod
    def validate_positive_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Activity amount must be strictly greater than 0.")
        return v

class CalculationBreakdown(BaseModel):
    formula: str
    activity_amount: float
    activity_unit: str
    emission_factor: float
    emission_factor_unit: str
    emissions_kg_co2e: float
    emissions_tonnes_co2e: float
    factor_source: str
    reference_year: str
    region: str
    notes: str

class CalculationResponse(BaseModel):
    id: str
    category: str
    activity_type: str
    activity_amount: float
    activity_unit: str
    emission_factor: float
    emission_factor_unit: str
    emissions_kg_co2e: float
    emissions_tonnes_co2e: float
    region: str
    source_notes: str
    created_at: datetime
    breakdown: CalculationBreakdown

class CalculationHistoryItem(BaseModel):
    id: str
    category: str
    activity_type: str
    activity_amount: float
    activity_unit: str
    emission_factor: float
    emission_factor_unit: str
    emissions_kg_co2e: float
    emissions_tonnes_co2e: float
    region: str
    source_notes: str
    created_at: datetime

# Dataset Schemas
class DatasetSummary(BaseModel):
    id: str
    filename: str
    original_name: str
    row_count: int
    columns: List[str]
    status: str
    is_demo: bool
    uploaded_at: datetime

class ColumnSuggestion(BaseModel):
    column: str
    suggested_role: Optional[str] = None # 'emissions', 'category', 'date', 'activity', 'department', 'feature'
    data_type: str
    sample_values: List[Any]
    missing_count: int

class DatasetPreviewResponse(BaseModel):
    id: str
    filename: str
    row_count: int
    columns: List[str]
    column_types: Dict[str, str]
    head_rows: List[Dict[str, Any]]
    column_suggestions: List[ColumnSuggestion]
    missing_summary: Dict[str, int]
    duplicate_count: int

class ColumnMappingRequest(BaseModel):
    emissions_col: str
    category_col: Optional[str] = None
    date_col: Optional[str] = None
    department_col: Optional[str] = None
    activity_col: Optional[str] = None

class DataAnalysisResponse(BaseModel):
    dataset_id: str
    total_records: int
    duplicate_records: int
    missing_values: Dict[str, int]
    total_emissions_kg: float
    total_emissions_tonnes: float
    mean_emissions_kg: float
    median_emissions_kg: float
    std_emissions_kg: float
    min_emissions_kg: float
    max_emissions_kg: float
    category_breakdown: List[Dict[str, Any]]
    department_breakdown: List[Dict[str, Any]]
    timeline_breakdown: List[Dict[str, Any]]
    correlations: Dict[str, Dict[str, float]]
    potential_outliers_count: int
    data_quality_score: float # 0 to 100
    quality_notes: List[str]

# ML Schemas
class MLTrainRequest(BaseModel):
    dataset_id: str
    target_column: str
    feature_columns: List[str]
    algorithm: str = Field("random_forest", description="linear_regression, random_forest, or gradient_boosting")
    test_size: float = Field(0.2, ge=0.1, le=0.5)
    split_strategy: str = Field("random", description="'random' or 'chronological'")
    date_column: Optional[str] = None

class MLModelMetrics(BaseModel):
    mae: float
    rmse: float
    r2_score: float
    train_samples: int
    test_samples: int
    feature_importances: Optional[Dict[str, float]] = None

class MLTrainResponse(BaseModel):
    model_id: str
    model_name: str
    algorithm: str
    dataset_id: str
    target_column: str
    features: List[str]
    metrics: MLModelMetrics
    actual_vs_predicted: List[Dict[str, Any]]
    residuals: List[Dict[str, Any]]
    explanation: Dict[str, str]

class MLPredictRequest(BaseModel):
    model_id: str
    features: Dict[str, Any]

class MLPredictResponse(BaseModel):
    prediction_id: str
    model_id: str
    model_name: str
    algorithm: str
    predicted_emissions_kg_co2e: float
    predicted_emissions_tonnes_co2e: float
    unit: str
    input_features: Dict[str, Any]
    limitations: List[str]
    baseline_comparison: Optional[Dict[str, Any]] = None

class MLClusteringRequest(BaseModel):
    dataset_id: str
    feature_columns: List[str]
    n_clusters: int = Field(3, ge=2, le=6)

class MLClusteringResponse(BaseModel):
    clusters_count: int
    cluster_profiles: List[Dict[str, Any]]
    scatter_points: List[Dict[str, Any]]

# Dashboard Schemas
class DashboardKPIs(BaseModel):
    total_emissions_kg: float
    total_emissions_tonnes: float
    average_per_record_kg: float
    highest_emitting_category: str
    highest_category_emissions_kg: float
    highest_category_percentage: float
    predicted_emissions_tonnes: Optional[float] = None
    records_analyzed: int
    period_comparison_pct: Optional[float] = None
    is_demo_data: bool

class DashboardDataResponse(BaseModel):
    kpis: DashboardKPIs
    category_emissions: List[Dict[str, Any]]
    category_percentages: List[Dict[str, Any]]
    emissions_over_time: List[Dict[str, Any]]
    emissions_distribution: List[Dict[str, Any]]
    department_comparison: List[Dict[str, Any]]
    actual_vs_predicted: Optional[List[Dict[str, Any]]] = None
    available_categories: List[str]
    available_departments: List[str]

# Recommendations & Scenarios
class RecommendationItem(BaseModel):
    id: str
    category: str
    title: str
    reason: str
    metric_value: str
    recommended_action: str
    impact_level: str # 'High', 'Medium', 'Low'
    urgency: str # 'Immediate', 'Medium-term', 'Strategic'
    is_saved: bool = False

class ScenarioSimulationRequest(BaseModel):
    baseline_emissions_kg: float
    reduction_percentage: float = Field(..., ge=0, le=100)
    category: str
    interventions: List[str]

class ScenarioSimulationResponse(BaseModel):
    scenario_label: str
    baseline_emissions_kg: float
    reduction_percentage: float
    hypothetical_savings_kg: float
    projected_emissions_kg: float
    disclaimer: str

class ActionPlanCreate(BaseModel):
    recommendation_id: str
    category: str
    title: str
    description: str
    potential_impact: str
    target_date: Optional[str] = ""
    notes: Optional[str] = ""

class ActionPlanResponse(BaseModel):
    id: str
    recommendation_id: str
    category: str
    title: str
    description: str
    potential_impact: str
    status: str
    target_date: str
    notes: str
    created_at: datetime
