import React, { useEffect, useState } from 'react';
import { Menu, Activity, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { DatasetItem } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  pageTitle: string;
  pageSubtitle?: string;
  activeDatasetId?: string;
  onSelectDataset?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  pageTitle,
  pageSubtitle,
  activeDatasetId,
  onSelectDataset,
}) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);

  useEffect(() => {
    api.getHealth()
      .then(() => setIsHealthy(true))
      .catch(() => setIsHealthy(false));

    api.getDatasets()
      .then((res) => setDatasets(res))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-none">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5 truncate max-w-md">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Dataset selector if callback provided and datasets exist */}
        {onSelectDataset && datasets.length > 0 && (
          <div className="hidden md:flex items-center space-x-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Database className="w-3.5 h-3.5 text-forest-600" />
            <span className="text-slate-400 font-medium">Dataset:</span>
            <select
              value={activeDatasetId || ''}
              onChange={(e) => onSelectDataset(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name} {d.is_demo ? '(Demo)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Backend health status badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isHealthy === true
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isHealthy === false
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title={isHealthy === true ? 'FastAPI Backend Online' : 'Backend Disconnected'}
        >
          {isHealthy === true ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : isHealthy === false ? (
            <AlertCircle className="w-3 h-3 text-rose-600" />
          ) : (
            <Activity className="w-3 h-3 animate-pulse text-slate-400" />
          )}
          <span className="hidden sm:inline">
            {isHealthy === true ? 'FastAPI Online' : isHealthy === false ? 'API Offline' : 'Checking...'}
          </span>
        </div>
      </div>
    </header>
  );
};
