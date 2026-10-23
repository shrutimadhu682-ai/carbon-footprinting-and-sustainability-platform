import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Database,
  Play,
  Sparkles,
  BarChart2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Layers,
  CheckCircle2,
  Shuffle
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { api } from '../services/api';
import {
  DatasetItem,
  DatasetPreview,
  MLTrainResult,
  MLPredictionResult,
  MLClusteringResult
} from '../types';

export const PredictionsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [preview, setPreview] = useState<DatasetPreview | null>(null);

  // Training Form State
  const [targetCol, setTargetCol] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [algorithm, setAlgorithm] = useState<string>('random_forest');
  const [testSize, setTestSize] = useState<number>(0.2);
  const [splitStrategy, setSplitStrategy] = useState<string>('random');
  const [dateCol, setDateCol] = useState<string>('');

  // Results State
  const [training, setTraining] = useState<boolean>(false);
  const [trainedModel, setTrainedModel] = useState<MLTrainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live Predict Form State
  const [featureInputs, setFeatureInputs] = useState<Record<string, any>>({});
  const [predicting, setPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<MLPredictionResult | null>(null);

  // Clustering State
  const [activeTab, setActiveTab] = useState<'regression' | 'clustering'>('regression');
  const [clusteringFeatures, setClusteringFeatures] = useState<string[]>([]);
  const [clusterCount, setClusterCount] = useState<number>(3);
  const [clusteringResult, setClusteringResult] = useState<MLClusteringResult | null>(null);
  const [clusteringLoading, setClusteringLoading] = useState<boolean>(false);

  useEffect(() => {
    api.getDatasets()
      .then((res) => {
        setDatasets(res);
        // Default to fleet transport if available, else first dataset
        const fleetDemo = res.find((d) => d.filename.includes('fleet'));
        const defaultId = fleetDemo ? fleetDemo.id : (res[0]?.id || '');
        setSelectedDatasetId(defaultId);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) return;
    api.getDatasetPreview(selectedDatasetId)
      .then((prev) => {
        setPreview(prev);
        // Heuristic target detection
        const target = prev.columns.find((c) => c.toLowerCase().includes('co2') || c.toLowerCase().includes('emission')) || prev.columns[prev.columns.length - 1];
        setTargetCol(target);

        // Features: all columns except target and ID
        const features = prev.columns.filter((c) => c !== target && !c.toLowerCase().includes('id'));
        setSelectedFeatures(features);

        // Date column heuristic
        const dateC = prev.columns.find((c) => c.toLowerCase().includes('date'));
        if (dateC) setDateCol(dateC);

        // Numeric features for clustering
        const numCols = prev.columns.filter((c) => {
          const t = prev.column_types[c] || '';
          return t.includes('int') || t.includes('float');
        }).filter((c) => c !== target);
        setClusteringFeatures(numCols.slice(0, 3));
      })
      .catch((err) => setError(err.message));
  }, [selectedDatasetId]);

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCol) {
      setError('Please select a target emissions column.');
      return;
    }
    if (selectedFeatures.length === 0) {
      setError('Please select at least one feature column for training.');
      return;
    }

    setTraining(true);
    setError(null);
    try {
      const res = await api.trainML({
        dataset_id: selectedDatasetId,
        target_column: targetCol,
        feature_columns: selectedFeatures,
        algorithm: algorithm,
        test_size: testSize,
        split_strategy: splitStrategy,
        date_column: dateCol || undefined,
      });
      setTrainedModel(res);

      // Pre-fill prediction inputs with sample values
      const initialInputs: Record<string, any> = {};
      selectedFeatures.forEach((f) => {
        const suggestion = preview?.column_suggestions.find((s) => s.column === f);
        if (suggestion && suggestion.sample_values.length > 0) {
          initialInputs[f] = suggestion.sample_values[0];
        } else {
          initialInputs[f] = '0';
        }
      });
      setFeatureInputs(initialInputs);
      setPredictionResult(null);
    } catch (err: any) {
      setError(err.message || 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainedModel) return;

    setPredicting(true);
    setError(null);
    try {
      // Cast numeric fields
      const formattedFeatures: Record<string, any> = {};
      Object.entries(featureInputs).forEach(([k, v]) => {
        const isNum = !isNaN(Number(v)) && v !== '';
        formattedFeatures[k] = isNum ? Number(v) : v;
      });

      const res = await api.predictEmissions({
        model_id: trainedModel.model_id,
        features: formattedFeatures,
      });
      setPredictionResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  const handleClustering = async () => {
    if (clusteringFeatures.length === 0) {
      setError('Please select at least one numeric feature for clustering.');
      return;
    }
    setClusteringLoading(true);
    setError(null);
    try {
      const res = await api.clusterML({
        dataset_id: selectedDatasetId,
        feature_columns: clusteringFeatures,
        n_clusters: clusterCount,
      });
      setClusteringResult(res);
    } catch (err: any) {
      setError(err.message || 'Clustering failed');
    } finally {
      setClusteringLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Sub-mode Tabs */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-forest-700" />
            <h2 className="text-base font-bold text-slate-900">Machine Learning Predictive Analytics</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Train Scikit-learn regression models with Scikit-learn pipelines or discover operational activity clusters using K-Means.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('regression')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'regression'
                ? 'bg-forest-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Supervised Regression
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clustering')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'clustering'
                ? 'bg-forest-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            K-Means Clustering
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode 1: Supervised Regression Pipeline */}
      {activeTab === 'regression' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Training Configuration (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-4 h-4 text-forest-700" />
                <h3 className="font-bold text-slate-900 text-sm">Model Training Configuration</h3>
              </div>

              <form onSubmit={handleTrain} className="space-y-4">
                {/* Dataset Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Dataset</label>
                  <select
                    value={selectedDatasetId}
                    onChange={(e) => setSelectedDatasetId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    {datasets.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.original_name} ({d.row_count} rows)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Column */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Column (Numerical Emissions) <span className="text-forest-600">*</span>
                  </label>
                  <select
                    value={targetCol}
                    onChange={(e) => setTargetCol(e.target.value)}
                    className="w-full text-xs font-bold bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    {preview?.columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Features Selection checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Predictor Feature Columns ({selectedFeatures.length} selected)
                  </label>
                  <div className="max-h-36 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    {preview?.columns
                      .filter((c) => c !== targetCol)
                      .map((col) => (
                        <label key={col} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(col)}
                            onChange={() => handleFeatureToggle(col)}
                            className="rounded border-slate-300 text-forest-600 focus:ring-forest-500"
                          />
                          <span className="font-medium truncate">{col}</span>
                        </label>
                      ))}
                  </div>
                </div>

                {/* Algorithm Choice */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Algorithm</label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none"
                    >
                      <option value="random_forest">Random Forest Regressor</option>
                      <option value="gradient_boosting">Gradient Boosting</option>
                      <option value="linear_regression">Linear Regression</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Split Strategy</label>
                    <select
                      value={splitStrategy}
                      onChange={(e) => setSplitStrategy(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none"
                    >
                      <option value="random">Random Split (80/20)</option>
                      <option value="chronological">Chronological Split</option>
                    </select>
                  </div>
                </div>

                {splitStrategy === 'chronological' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date Column for Sorting</label>
                    <select
                      value={dateCol}
                      onChange={(e) => setDateCol(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    >
                      <option value="">(Auto-detect)</option>
                      {preview?.columns.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={training}
                  className="w-full py-2.5 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{training ? 'Training Pipeline...' : 'Train & Evaluate Model'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Model Evaluation & Predictions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {trainedModel ? (
              <div className="space-y-6">
                {/* Metric Cards Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">R² Score</span>
                    <div className="text-2xl font-extrabold text-forest-800 mt-1">
                      {(trainedModel.metrics.r2_score * 100).toFixed(1)}%
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Coefficient of determination</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">MAE</span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      ±{trainedModel.metrics.mae}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mean Absolute Error (kg)</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">RMSE</span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      {trainedModel.metrics.rmse}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Root Mean Squared Error (kg)</p>
                  </div>
                </div>

                {/* Explanation Banner */}
                <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-200 text-xs text-forest-900 space-y-1">
                  <span className="font-bold text-[11px] uppercase tracking-wider">Evaluation Interpretation:</span>
                  <p>{trainedModel.explanation.r2_score}</p>
                  <p className="text-slate-600">{trainedModel.explanation.mae} {trainedModel.explanation.split_info}</p>
                </div>

                {/* Actual vs Predicted Scatter Chart */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">Actual vs. Predicted Emissions (Held-Out Test Set)</h4>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          type="number"
                          dataKey="actual"
                          name="Actual"
                          unit="kg"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <YAxis
                          type="number"
                          dataKey="predicted"
                          name="Predicted"
                          unit="kg"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                        />
                        <Scatter name="Emissions" data={trainedModel.actual_vs_predicted} fill="#15803d" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interactive Predictor Form */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-900 text-sm">Predict Emissions on New Inputs</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Trained Pipeline: {trainedModel.algorithm}</span>
                  </div>

                  <form onSubmit={handlePredict} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {trainedModel.features.map((feat) => (
                        <div key={feat}>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">{feat}</label>
                          <input
                            type="text"
                            value={featureInputs[feat] ?? ''}
                            onChange={(e) =>
                              setFeatureInputs((prev) => ({ ...prev, [feat]: e.target.value }))
                            }
                            required
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-forest-500"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={predicting}
                      className="w-full py-2.5 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                    >
                      {predicting ? 'Calculating Prediction...' : 'Generate Prediction'}
                    </button>
                  </form>

                  {/* Prediction Output Display */}
                  {predictionResult && (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                          Predicted Emissions
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                          {predictionResult.algorithm}
                        </span>
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-extrabold text-emerald-950">
                          {predictionResult.predicted_emissions_kg_co2e.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-emerald-700">kg CO2e</span>
                        <span className="text-xs text-slate-500">
                          ({predictionResult.predicted_emissions_tonnes_co2e} tCO2e)
                        </span>
                      </div>
                      <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600 space-y-1">
                        <span className="font-semibold block text-slate-700">Operational Limitations:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                          {predictionResult.limitations.map((lim, i) => (
                            <li key={i}>{lim}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[360px] space-y-3">
                <BrainCircuit className="w-12 h-12 text-slate-300" />
                <h3 className="font-bold text-slate-800 text-sm">No Trained Model Active</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Configure feature parameters on the left and click "Train & Evaluate Model" to execute real Scikit-learn pipelines with 80/20 train/test evaluation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Unsupervised K-Means Clustering */}
      {activeTab === 'clustering' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-forest-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">K-Means Activity & Emission Archetype Discovery</h3>
                <p className="text-xs text-slate-500">
                  Unsupervised clustering to group similar operational observations into distinct emission intensity profiles (Not a regression model).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Clusters (k)</label>
                <select
                  value={clusterCount}
                  onChange={(e) => setClusterCount(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                >
                  <option value={2}>2 Clusters</option>
                  <option value={3}>3 Clusters (Recommended: Low/Mid/High)</option>
                  <option value={4}>4 Clusters</option>
                  <option value={5}>5 Clusters</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={handleClustering}
                  disabled={clusteringLoading}
                  className="w-full py-2 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>{clusteringLoading ? 'Clustering...' : 'Execute K-Means Clustering'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Clustering Results */}
          {clusteringResult && (
            <div className="space-y-6">
              {/* Cluster Profiles Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clusteringResult.cluster_profiles.map((cp) => (
                  <div key={cp.cluster_id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{cp.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                        {cp.percentage}% of data
                      </span>
                    </div>

                    <div className="text-xl font-bold text-forest-800">
                      {cp.sample_count} observations
                    </div>

                    <div className="text-[11px] space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-700 block">Feature Averages:</span>
                      {Object.entries(cp.feature_averages).map(([col, stats]) => (
                        <div key={col} className="flex justify-between text-slate-600">
                          <span className="truncate max-w-[130px]">{col}:</span>
                          <span className="font-mono font-medium">{stats.mean}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 2D Projection Scatter */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">2D Dimension-Reduced Cluster Visualization (PCA)</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" dataKey="x" name="Dimension 1" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis type="number" dataKey="y" name="Dimension 2" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Clusters" data={clusteringResult.scatter_points} fill="#0d9488" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
