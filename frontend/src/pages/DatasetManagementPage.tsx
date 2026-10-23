import React, { useState, useEffect } from 'react';
import {
  Upload,
  Database,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Eye,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetItem, DatasetPreview } from '../types';

export const DatasetManagementPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = () => {
    api.getDatasets()
      .then((res) => {
        setDatasets(res);
        if (res.length > 0 && !selectedDatasetId) {
          setSelectedDatasetId(res[0].id);
          loadPreview(res[0].id);
        }
      })
      .catch((err) => setError(err.message));
  };

  const loadPreview = (id: string) => {
    api.getDatasetPreview(id, 10)
      .then((res) => setPreview(res))
      .catch((err) => setError(err.message));
  };

  const handleSelectDataset = (id: string) => {
    setSelectedDatasetId(id);
    loadPreview(id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV (.csv) files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const uploaded = await api.uploadDataset(file);
      setSuccessMsg(`Dataset "${uploaded.original_name}" uploaded and indexed successfully (${uploaded.row_count} rows).`);
      loadDatasets();
      setSelectedDatasetId(uploaded.id);
      loadPreview(uploaded.id);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Dataset Management & Ingestion</h2>
          <p className="text-xs text-slate-500">
            Upload custom corporate activity CSVs, inspect columns, download standardized templates, and export cleaned datasets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.getTemplateDownloadUrl()}
            download
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-forest-700" />
            <span>Download CSV Template</span>
          </a>

          {selectedDatasetId && (
            <a
              href={api.getCleanExportUrl(selectedDatasetId)}
              download
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Clean CSV</span>
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Zone & Dataset Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Upload New Dataset</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload activity logs formatted as CSV. Max file size: 10 MB. Server validates content, schema, and sanitizes filenames.
            </p>

            <label className="block border-2 border-dashed border-slate-200 hover:border-forest-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-forest-50/20">
              <Upload className="w-8 h-8 text-forest-600 mx-auto mb-2" />
              <span className="text-xs font-semibold text-slate-700 block">Click or Drag CSV here</span>
              <span className="text-[11px] text-slate-400 block mt-1">.csv format only</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {uploading && (
              <div className="text-center py-2 text-xs text-forest-700 font-medium animate-pulse">
                Validating and uploading dataset...
              </div>
            )}

            {/* Documented Licensing Notice */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center space-x-1 font-semibold text-slate-700">
                <Info className="w-3.5 h-3.5 text-forest-700" />
                <span>Verified Licensing & Sources</span>
              </div>
              <p>
                Preloaded demo datasets conform to open data licenses: India CEA CO2 Database (Gov of India), UK DEFRA Open Government Licence v3.0, and IPCC 2006.
              </p>
            </div>
          </div>
        </div>

        {/* Dataset Directory Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Indexed Datasets ({datasets.length})</h3>
              <span className="text-xs text-slate-400 font-medium">Select to preview schema</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Dataset Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Rows</th>
                    <th className="py-2.5 px-3">Columns</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {datasets.map((d) => {
                    const isSelected = d.id === selectedDatasetId;
                    return (
                      <tr
                        key={d.id}
                        onClick={() => handleSelectDataset(d.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-forest-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{d.original_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{d.filename}</div>
                        </td>
                        <td className="py-3 px-3">
                          {d.is_demo ? (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                              Pre-loaded Demo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                              User Upload
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium">{d.row_count.toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-500">{d.columns.length} cols</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDataset(d.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              isSelected
                                ? 'bg-forest-700 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? 'Active' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Preview Section */}
      {preview && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dataset Schema & First 10 Rows Preview</h3>
              <p className="text-xs text-slate-500">
                {preview.filename} • {preview.row_count} total observations • {preview.duplicate_count} duplicate rows detected
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium">
                {preview.columns.length} Total Columns
              </span>
            </div>
          </div>

          {/* Missing value summary badges */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Column Null / Missing Analysis:
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(preview.missing_summary).map(([col, missingCount]) => (
                <div
                  key={col}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1.5 ${
                    missingCount > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="font-semibold">{col}:</span>
                  <span>{missingCount > 0 ? `${missingCount} missing` : '0 missing'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  {preview.columns.map((col) => (
                    <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                      {col}
                      <span className="block text-[10px] text-slate-400 font-normal font-mono lowercase">
                        {preview.column_types[col]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {preview.head_rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    {preview.columns.map((col) => (
                      <td key={col} className="py-2.5 px-3 whitespace-nowrap max-w-xs truncate">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-300 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
