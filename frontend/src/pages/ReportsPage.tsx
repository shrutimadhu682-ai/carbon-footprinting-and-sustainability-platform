import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Layers,
  Database,
  CloudRain,
  Flame,
  BrainCircuit,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetItem } from '../types';

export const ReportsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    loadReport();
  }, [selectedDatasetId, selectedPeriod]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReportSummary(selectedDatasetId || undefined, selectedPeriod);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="no-print p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Executive Sustainability & ESG Reporting</h2>
          <p className="text-xs text-slate-500">
            Generate and export auditable greenhouse gas performance statements for academic evaluation and enterprise governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDatasetId}
            onChange={(e) => setSelectedDatasetId(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.original_name} {d.is_demo ? '(Demo)' : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          <a
            href={api.getReportCsvExportUrl(selectedDatasetId)}
            download
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-forest-700" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Printable Report Document Sheet */}
      {reportData && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-200 pb-6 gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-forest-700">
                Official Sustainability Disclosure
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {reportData.report_title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Generated per GHG Protocol Corporate Accounting Standard
              </p>
            </div>

            <div className="text-xs text-right text-slate-500 font-mono space-y-1">
              <div>Date: {reportData.generated_at}</div>
              <div>Horizon: {reportData.reporting_period}</div>
              {reportData.kpis.is_demo_data && (
                <span className="inline-block px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded font-sans font-semibold">
                  Demo Dataset Mode
                </span>
              )}
            </div>
          </div>

          {/* KPI Summary Block */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Emissions</span>
              <div className="text-2xl font-extrabold text-forest-800 mt-0.5">
                {reportData.kpis.total_emissions_tonnes.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">metric tonnes (tCO2e)</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Observations Logged</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {reportData.kpis.records_analyzed.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">verified activity records</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Major Contributor</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5 truncate">
                {reportData.kpis.highest_emitting_category}
              </div>
              <span className="text-[11px] text-slate-500">{reportData.kpis.highest_category_percentage}% of total</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Average Intensity</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {reportData.kpis.average_per_record_kg.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">kg CO2e per activity</span>
            </div>
          </div>

          {/* Category-wise Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              1. Category-Wise Greenhouse Gas Distribution
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Emission Category</th>
                    <th className="py-2.5 px-3">Metric Tonnes (tCO2e)</th>
                    <th className="py-2.5 px-3">Kilograms (kg CO2e)</th>
                    <th className="py-2.5 px-3 text-right">Contribution (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.category_emissions.map((c: any, i: number) => {
                    const pctObj = reportData.category_percentages.find((p: any) => p.name === c.category);
                    return (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{c.category}</td>
                        <td className="py-2.5 px-3 font-bold text-forest-800">{c.emissions_tonnes.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono">{c.emissions_kg.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {pctObj ? `${pctObj.percentage}%` : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Machine Learning Pipeline Performance Block */}
          {reportData.ml_model_evaluation ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Machine Learning Predictive Model Evaluation
              </h3>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-slate-900">
                  <span>Model: {reportData.ml_model_evaluation.model_name}</span>
                  <span className="font-mono text-slate-500">Algorithm: {reportData.ml_model_evaluation.algorithm}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">R² Score:</span>
                    <span className="font-bold text-forest-800 text-sm">
                      {(reportData.ml_model_evaluation.metrics.r2_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">MAE:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ±{reportData.ml_model_evaluation.metrics.mae} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">RMSE:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {reportData.ml_model_evaluation.metrics.rmse} kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-slate-500 italic border-t border-slate-100 pt-3">
              <span>* Machine Learning model has not yet been executed on this dataset. Train a model in the "ML Predictions" tab to append evaluation metrics to this report.</span>
            </div>
          )}

          {/* Methodology & Verification Signoff */}
          <div className="space-y-2 border-t border-slate-200 pt-6 text-[11px] text-slate-500 leading-relaxed">
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Methodological Standards & Declarations
            </h4>
            <p>{reportData.methodology}</p>
            <p className="italic">{reportData.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};
