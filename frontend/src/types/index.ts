export interface CalculationCategory {
  key: string;
  name: string;
  unit: string;
  description: string;
  subcategories_count: number;
}

export interface FactorDetail {
  name: string;
  factor: number;
  unit: string;
  region: string;
  source: string;
  reference_year: string;
  notes: string;
}

export interface EmissionRegistry {
  [categoryKey: string]: {
    name: string;
    unit: string;
    description: string;
    subcategories: {
      [subcatKey: string]: FactorDetail;
    };
  };
}

export interface CalculationInput {
  category: string;
  subcategory: string;
  activity_amount: number;
  custom_factor?: number | null;
  region?: string;
  notes?: string;
}

export interface CalculationBreakdown {
  formula: string;
  activity_amount: number;
  activity_unit: string;
  emission_factor: number;
  emission_factor_unit: string;
  emissions_kg_co2e: floatNumber;
  emissions_tonnes_co2e: floatNumber;
  factor_source: string;
  reference_year: string;
  region: string;
  notes: string;
}

type floatNumber = number;

export interface CalculationResult {
  id: string;
  category: string;
  activity_type: string;
  activity_amount: number;
  activity_unit: string;
  emission_factor: number;
  emission_factor_unit: string;
  emissions_kg_co2e: number;
  emissions_tonnes_co2e: number;
  region: string;
  source_notes: string;
  created_at: string;
  breakdown?: CalculationBreakdown;
}

export interface CalculationHistoryResponse {
  items: CalculationResult[];
  total: number;
  skip: number;
  limit: number;
}

export interface DatasetItem {
  id: string;
  filename: string;
  original_name: string;
  row_count: number;
  columns: string[];
  status: string;
  is_demo: boolean;
  uploaded_at: string;
}

export interface ColumnSuggestion {
  column: string;
  suggested_role: string | null;
  data_type: string;
  sample_values: (string | number)[];
  missing_count: number;
}

export interface DatasetPreview {
  id: string;
  filename: string;
  row_count: number;
  columns: string[];
  column_types: Record<string, string>;
  head_rows: Record<string, any>[];
  column_suggestions: ColumnSuggestion[];
  missing_summary: Record<string, number>;
  duplicate_count: number;
}

export interface DataAnalysis {
  dataset_id: string;
  total_records: number;
  duplicate_records: number;
  missing_values: Record<string, number>;
  total_emissions_kg: number;
  total_emissions_tonnes: number;
  mean_emissions_kg: number;
  median_emissions_kg: number;
  std_emissions_kg: number;
  min_emissions_kg: number;
  max_emissions_kg: number;
  category_breakdown: Array<{
    category: string;
    total_emissions_kg: number;
    total_emissions_tonnes: number;
    records_count: number;
    average_emissions_kg: number;
    percentage: number;
  }>;
  department_breakdown: Array<{
    department: string;
    total_emissions_kg: number;
    total_emissions_tonnes: number;
    records_count: number;
    percentage: number;
  }>;
  timeline_breakdown: Array<{
    period: string;
    emissions_kg: number;
    emissions_tonnes: number;
    records_count: number;
  }>;
  correlations: Record<string, Record<string, number>>;
  potential_outliers_count: number;
  data_quality_score: number;
  quality_notes: string[];
}

export interface DashboardKPIs {
  total_emissions_kg: number;
  total_emissions_tonnes: number;
  average_per_record_kg: number;
  highest_emitting_category: string;
  highest_category_emissions_kg: number;
  highest_category_percentage: number;
  predicted_emissions_tonnes?: number | null;
  records_analyzed: number;
  period_comparison_pct?: number | null;
  is_demo_data: boolean;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  category_emissions: Array<{
    category: string;
    emissions_kg: number;
    emissions_tonnes: number;
  }>;
  category_percentages: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  emissions_over_time: Array<{
    period: string;
    emissions_kg: number;
    emissions_tonnes: number;
  }>;
  emissions_distribution: Array<{
    range: string;
    count: number;
  }>;
  department_comparison: Array<{
    department: string;
    emissions_kg: number;
    emissions_tonnes: number;
    count: number;
  }>;
  available_categories: string[];
  available_departments: string[];
}

export interface MLModelMetrics {
  mae: number;
  rmse: number;
  r2_score: number;
  train_samples: number;
  test_samples: number;
  feature_importances?: Record<string, number>;
}

export interface MLTrainResult {
  model_id: string;
  model_name: string;
  algorithm: string;
  dataset_id: string;
  target_column: string;
  features: string[];
  metrics: MLModelMetrics;
  actual_vs_predicted: Array<{ actual: number; predicted: number }>;
  residuals: Array<{ actual: number; residual: number }>;
  explanation: Record<string, string>;
}

export interface MLPredictionResult {
  prediction_id: string;
  model_id: string;
  model_name: string;
  algorithm: string;
  predicted_emissions_kg_co2e: number;
  predicted_emissions_tonnes_co2e: number;
  unit: string;
  input_features: Record<string, any>;
  limitations: string[];
  baseline_comparison?: Record<string, any>;
}

export interface MLClusteringResult {
  clusters_count: number;
  cluster_profiles: Array<{
    cluster_id: number;
    label: string;
    sample_count: number;
    percentage: number;
    feature_averages: Record<string, { mean: number; min: number; max: number }>;
  }>;
  scatter_points: Array<{ x: number; y: number; cluster: number }>;
}

export interface RecommendationItem {
  id: string;
  category: string;
  title: string;
  reason: string;
  metric_value: string;
  recommended_action: string;
  impact_level: string;
  urgency: string;
  is_saved: boolean;
}

export interface ActionPlan {
  id: string;
  recommendation_id: string;
  category: string;
  title: string;
  description: string;
  potential_impact: string;
  status: string;
  target_date: string;
  notes: string;
  created_at: string;
}

export interface ScenarioResult {
  scenario_label: string;
  baseline_emissions_kg: number;
  reduction_percentage: number;
  hypothetical_savings_kg: number;
  projected_emissions_kg: number;
  disclaimer: string;
}
