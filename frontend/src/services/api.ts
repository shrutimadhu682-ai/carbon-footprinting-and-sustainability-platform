import {
  CalculationCategory,
  EmissionRegistry,
  CalculationInput,
  CalculationResult,
  CalculationHistoryResponse,
  DatasetItem,
  DatasetPreview,
  DataAnalysis,
  DashboardData,
  MLTrainResult,
  MLPredictionResult,
  MLClusteringResult,
  RecommendationItem,
  ActionPlan,
  ScenarioResult
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...(!options?.body || options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // System Health
  async getHealth(): Promise<{ status: string; service: string; version: string }> {
    return request('/health');
  },

  // Carbon Calculator
  async getCategories(): Promise<{ categories: CalculationCategory[]; registry: EmissionRegistry }> {
    return request('/calculations/categories');
  },

  async calculate(data: CalculationInput): Promise<CalculationResult> {
    return request('/calculations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCalculations(skip = 0, limit = 50, category?: string): Promise<CalculationHistoryResponse> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (category && category !== 'All') params.append('category', category);
    return request(`/calculations?${params.toString()}`);
  },

  async deleteCalculation(id: string): Promise<{ message: string; id: string }> {
    return request(`/calculations/${id}`, { method: 'DELETE' });
  },

  getCalculationExportUrl(): string {
    return `${API_BASE_URL}/calculations/export/csv`;
  },

  // Datasets
  async getDatasets(): Promise<DatasetItem[]> {
    return request('/datasets');
  },

  async uploadDataset(file: File): Promise<DatasetItem> {
    const formData = new FormData();
    formData.append('file', file);
    return request('/datasets/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async getDatasetPreview(id: string, maxRows = 10): Promise<DatasetPreview> {
    return request(`/datasets/${id}/preview?max_rows=${maxRows}`);
  },

  async analyzeDataset(
    id: string,
    mapping: {
      emissions_col: string;
      category_col?: string;
      date_col?: string;
      department_col?: string;
      activity_col?: string;
    }
  ): Promise<DataAnalysis> {
    return request(`/datasets/${id}/analyze`, {
      method: 'POST',
      body: JSON.stringify(mapping),
    });
  },

  getTemplateDownloadUrl(): string {
    return `${API_BASE_URL}/datasets/template/download`;
  },

  getCleanExportUrl(id: string): string {
    return `${API_BASE_URL}/datasets/${id}/export-clean`;
  },

  // Dashboard
  async getDashboardSummary(params?: {
    dataset_id?: string;
    category_filter?: string;
    department_filter?: string;
    period_filter?: string;
  }): Promise<DashboardData> {
    const searchParams = new URLSearchParams();
    if (params?.dataset_id) searchParams.append('dataset_id', params.dataset_id);
    if (params?.category_filter && params.category_filter !== 'All') searchParams.append('category_filter', params.category_filter);
    if (params?.department_filter && params.department_filter !== 'All') searchParams.append('department_filter', params.department_filter);
    if (params?.period_filter && params.period_filter !== 'All') searchParams.append('period_filter', params.period_filter);

    return request(`/dashboard/summary?${searchParams.toString()}`);
  },

  // Machine Learning
  async trainML(data: {
    dataset_id: string;
    target_column: string;
    feature_columns: string[];
    algorithm: string;
    test_size: number;
    split_strategy: string;
    date_column?: string;
  }): Promise<MLTrainResult> {
    return request('/ml/train', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMLModels(): Promise<any[]> {
    return request('/ml/models');
  },

  async predictEmissions(data: { model_id: string; features: Record<string, any> }): Promise<MLPredictionResult> {
    return request('/ml/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async clusterML(data: { dataset_id: string; feature_columns: string[]; n_clusters: number }): Promise<MLClusteringResult> {
    return request('/ml/cluster', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Recommendations & Actions
  async getRecommendations(datasetId?: string): Promise<RecommendationItem[]> {
    const params = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : '';
    return request(`/recommendations${params}`);
  },

  async simulateScenario(data: {
    baseline_emissions_kg: number;
    reduction_percentage: number;
    category: string;
    interventions: string[];
  }): Promise<ScenarioResult> {
    return request('/recommendations/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getActionPlans(): Promise<ActionPlan[]> {
    return request('/recommendations/action-plans');
  },

  async createActionPlan(data: {
    recommendation_id: string;
    category: string;
    title: string;
    description: string;
    potential_impact: string;
    target_date?: string;
    notes?: string;
  }): Promise<ActionPlan> {
    return request('/recommendations/action-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteActionPlan(id: string): Promise<{ message: string; id: string }> {
    return request(`/recommendations/action-plans/${id}`, { method: 'DELETE' });
  },

  // Reports
  async getReportSummary(datasetId?: string, period?: string): Promise<any> {
    const params = new URLSearchParams();
    if (datasetId) params.append('dataset_id', datasetId);
    if (period && period !== 'All') params.append('period', period);
    return request(`/reports/summary?${params.toString()}`);
  },

  getReportCsvExportUrl(datasetId?: string): string {
    return datasetId ? `${API_BASE_URL}/reports/export-csv?dataset_id=${encodeURIComponent(datasetId)}` : `${API_BASE_URL}/reports/export-csv`;
  },
};
