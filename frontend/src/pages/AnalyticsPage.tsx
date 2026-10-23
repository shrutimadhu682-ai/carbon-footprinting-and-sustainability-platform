import React, { useState, useEffect } from 'react';
import {
  LineChart as ChartIcon,
  Database,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetItem, DatasetPreview, DataAnalysis } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [analysis, setAnalysis] = useState<DataAnalysis | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Column Mappings State
  const [emissionsCol, setEmissionsCol] = useState<string>('');
  const [categoryCol, setCategoryCol] = useState<string>('');
  const [dateCol, setDateCol] = useState<string>('');
  const [departmentCol, setDepartmentCol] = useState<string>('');
  const [activityCol, setActivityCol] = useState<string>('');

  useEffect(() => {
    api.getDatasets()
      .then((res) => {
        setDatasets(res);
        if (res.length > 0) {
          setSelectedDatasetId(res[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) return;

    setLoadingPreview(true);
    setError(null);
    api.getDatasetPreview(selectedDatasetId)
      .then((prev) => {
        setPreview(prev);
        // Apply intelligent suggestions
        let defaultEmiss = '';
        let defaultCat = '';
        let defaultDate = '';
        let defaultDept = '';
        let defaultAct = '';

        for (const s of prev.column_suggestions) {
          if (s.suggested_role === 'emissions' && !defaultEmiss) defaultEmiss = s.column;
          else if (s.suggested_role === 'category' && !defaultCat) defaultCat = s.column;
          else if (s.suggested_role === 'date' && !defaultDate) defaultDate = s.column;
          else if (s.suggested_role === 'department' && !defaultDept) defaultDept = s.column;
          else if (s.suggested_role === 'activity' && !defaultAct) defaultAct = s.column;
        }

        // Fallback search
        if (!defaultEmiss) {
          const found = prev.columns.find((c) => c.toLowerCase().includes('co2') || c.toLowerCase().includes('emission'));
          if (found) defaultEmiss = found;
          else defaultEmiss = prev.columns[prev.columns.length - 1];
        }

        setEmissionsCol(defaultEmiss);
        setCategoryCol(defaultCat || '');
        setDateCol(defaultDate || '');
        setDepartmentCol(defaultDept || '');
        setActivityCol(defaultAct || '');

        // Auto trigger initial analysis with suggested mappings
        runAnalysis(selectedDatasetId, {
          emissions_col: defaultEmiss,
          category_col: defaultCat || undefined,
          date_col: defaultDate || undefined,
          department_col: defaultDept || undefined,
          activity_col: defaultAct || undefined,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingPreview(false));
  }, [selectedDatasetId]);

  const runAnalysis = async (
    datasetId: string,
    mapping: {
      emissions_col: string;
      category_col?: string;
      date_col?: string;
      department_col?: string;
      activity_col?: string;
    }
  ) => {
    setLoadingAnalysis(true);
    setError(null);
    try {
      const res = await api.analyzeDataset(datasetId, mapping);
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze dataset');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleApplyMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emissionsCol) {
      setError('Please select an emissions target column.');
      return;
    }
    runAnalysis(selectedDatasetId, {
      emissions_col: emissionsCol,
      category_col: categoryCol || undefined,
      date_col: dateCol || undefined,
      department_col: departmentCol || undefined,
      activity_col: activityCol || undefined,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Dataset Selector */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">10-Stage Data Processing & Exploratory Analytics</h2>
            <p className="text-xs text-slate-500">
              Select any uploaded or demo CSV to run cleaning, column mapping, outlier audits, and statistical summaries.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Dataset:</span>
          <select
            value={selectedDatasetId}
            onChange={(e) => setSelectedDatasetId(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-forest-500 min-w-[200px]"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.original_name} ({d.row_count} rows)
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Configurable Column Mapping Engine Card */}
      {preview && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-forest-700" />
              <h3 className="font-bold text-slate-900 text-sm">Configurable Field Mapping Interface</h3>
            </div>
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
              Auto-suggested heuristics applied
            </span>
          </div>

          <form onSubmit={handleApplyMapping} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Emissions Target <span className="text-forest-600">*</span>
              </label>
              <select
                value={emissionsCol}
                onChange={(e) => setEmissionsCol(e.target.value)}
                className="w-full text-xs font-semibold bg-emerald-50/50 border border-emerald-300 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none"
              >
                {preview.columns.map((c) => (
                  <option key={c} value={c}>
                    {c} ({preview.column_types[c] || 'num'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Category Field
              </label>
              <select
                value={categoryCol}
                onChange={(e) => setCategoryCol(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none"
              >
                <option value="">(None / All Activities)</option>
                {preview.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Date / Period Field
              </label>
              <select
                value={dateCol}
                onChange={(e) => setDateCol(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none"
              >
                <option value="">(None / No Date)</option>
                {preview.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Facility / Department
              </label>
              <select
                value={departmentCol}
                onChange={(e) => setDepartmentCol(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none"
              >
                <option value="">(None)</option>
                {preview.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loadingAnalysis}
                className="w-full py-2 px-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <span>{loadingAnalysis ? 'Analyzing...' : 'Confirm & Run'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-6">
          {/* Quality & Descriptive Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Quality Score</span>
                <ShieldCheck className="w-4 h-4 text-forest-700" />
              </div>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold text-forest-800">{analysis.data_quality_score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {analysis.duplicate_records} duplicates • {Object.values(analysis.missing_values).reduce((a, b) => a + b, 0)} missing values
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Measured Footprint</span>
                <ChartIcon className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold text-slate-900">{analysis.total_emissions_tonnes.toLocaleString()}</span>
                <span className="text-xs font-semibold text-slate-500">tCO2e</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 font-mono">
                {analysis.total_emissions_kg.toLocaleString()} kg CO2e
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mean & Median</span>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-900">{analysis.mean_emissions_kg.toLocaleString()}</span>
                <span className="text-xs text-slate-400">avg kg</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Median: {analysis.median_emissions_kg.toLocaleString()} kg • Std: {analysis.std_emissions_kg.toLocaleString()}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IQR Outliers Flagged</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold text-amber-700">{analysis.potential_outliers_count}</span>
                <span className="text-xs text-slate-400">records</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Beyond 1.5 × IQR [Min: {analysis.min_emissions_kg} - Max: {analysis.max_emissions_kg.toLocaleString()} kg]
              </p>
            </div>
          </div>

          {/* Data Quality Observations Banner */}
          {analysis.quality_notes.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                Pipeline Quality Audit Observations:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                {analysis.quality_notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Category Decomposition Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Activity Category Decomposition</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Records Count</th>
                    <th className="py-2.5 px-3">Total (kg CO2e)</th>
                    <th className="py-2.5 px-3">Metric Tonnes (tCO2e)</th>
                    <th className="py-2.5 px-3">Average per Activity</th>
                    <th className="py-2.5 px-3">Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {analysis.category_breakdown.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{c.category}</td>
                      <td className="py-2.5 px-3">{c.records_count}</td>
                      <td className="py-2.5 px-3 font-mono">{c.total_emissions_kg.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-bold text-forest-800">{c.total_emissions_tonnes}</td>
                      <td className="py-2.5 px-3 font-mono">{c.average_emissions_kg.toLocaleString()} kg</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-forest-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, c.percentage)}%` }} />
                          </div>
                          <span className="font-semibold text-slate-800">{c.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Numeric Correlation Matrix */}
          {Object.keys(analysis.correlations).length > 1 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Numeric Feature Correlation Matrix</h3>
                <p className="text-xs text-slate-500">
                  Pearson linear correlation coefficient (r) between continuous variables (-1.0 to +1.0)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200">
                    <tr>
                      <th className="py-2 px-3 font-sans font-semibold">Variable</th>
                      {Object.keys(analysis.correlations).map((col) => (
                        <th key={col} className="py-2 px-3 truncate max-w-[120px]">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(analysis.correlations).map(([rowKey, rowVals]) => (
                      <tr key={rowKey}>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{rowKey}</td>
                        {Object.keys(analysis.correlations).map((colKey) => {
                          const val = rowVals[colKey] ?? 0;
                          const intensity = Math.abs(val);
                          return (
                            <td
                              key={colKey}
                              className={`py-2.5 px-3 text-center ${
                                val === 1
                                  ? 'bg-slate-50 text-slate-400 font-normal'
                                  : val > 0.6
                                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                                  : val < -0.6
                                  ? 'bg-rose-50 text-rose-800 font-bold'
                                  : 'text-slate-600'
                              }`}
                            >
                              {val.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
