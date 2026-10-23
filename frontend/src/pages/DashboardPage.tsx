import React, { useEffect, useState, useCallback } from 'react';
import {
  CloudRain,
  Flame,
  Layers,
  Sparkles,
  RotateCcw,
  RefreshCw,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../services/api';
import { DashboardData, DatasetItem } from '../types';
import { MetricCard } from '../components/MetricCard';

const COLORS = ['#15803d', '#059669', '#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#d97706'];

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardSummary({
        dataset_id: selectedDataset || undefined,
        category_filter: selectedCategory !== 'All' ? selectedCategory : undefined,
        department_filter: selectedDepartment !== 'All' ? selectedDepartment : undefined,
        period_filter: selectedPeriod !== 'All' ? selectedPeriod : undefined,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedDataset, selectedCategory, selectedDepartment, selectedPeriod]);

  useEffect(() => {
    api.getDatasets()
      .then((res) => {
        setDatasets(res);
        if (res.length > 0 && !selectedDataset) {
          setSelectedDataset(res[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedDepartment('All');
    setSelectedPeriod('All');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-slate-800">
            <Filter className="w-4 h-4 text-forest-700" />
            <h2 className="text-sm font-bold tracking-tight">Interactive Dashboard Filters</h2>
            {data?.kpis.is_demo_data && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                Demo Dataset Mode
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
            <button
              type="button"
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-medium shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Active Dataset
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-forest-500"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name} {d.is_demo ? '(Demo)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-forest-500"
            >
              <option value="All">All Categories</option>
              {data?.available_categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Facility / Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-forest-500"
            >
              <option value="All">All Facilities</option>
              {data?.available_departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Reporting Month
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-forest-500"
            >
              <option value="All">All Months (2024)</option>
              {data?.emissions_over_time.map((t) => (
                <option key={t.period} value={t.period}>
                  {t.period}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div>
            <span className="font-semibold">Unable to load dashboard data:</span> {error}
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Emissions"
            value={data.kpis.total_emissions_tonnes.toLocaleString()}
            unit="tCO2e"
            icon={<CloudRain className="w-5 h-5" />}
            tooltip="Total aggregated greenhouse gas emissions converted to metric tonnes of CO2 equivalent per GHG protocol standard."
            isDemo={data.kpis.is_demo_data}
            highlight
          />

          <MetricCard
            title="Avg per Record"
            value={data.kpis.average_per_record_kg.toLocaleString()}
            unit="kg CO2e"
            icon={<BarChart2 className="w-5 h-5" />}
            tooltip="Average carbon footprint per recorded activity item across the selected filters."
            isDemo={data.kpis.is_demo_data}
          />

          <MetricCard
            title="Highest Category"
            value={data.kpis.highest_emitting_category}
            unit={`${data.kpis.highest_category_percentage}%`}
            icon={<Flame className="w-5 h-5 text-amber-600" />}
            tooltip="Activity sector responsible for the largest share of measured footprint."
            isDemo={data.kpis.is_demo_data}
          />

          <MetricCard
            title="Predicted Target"
            value={data.kpis.predicted_emissions_tonnes ? data.kpis.predicted_emissions_tonnes.toLocaleString() : 'Pending ML'}
            unit={data.kpis.predicted_emissions_tonnes ? 'tCO2e' : undefined}
            icon={<Sparkles className="w-5 h-5 text-indigo-600" />}
            tooltip="Forward-looking emission estimate derived from trained Scikit-learn regression models."
            isDemo={data.kpis.is_demo_data}
          />

          <MetricCard
            title="Records Analyzed"
            value={data.kpis.records_analyzed.toLocaleString()}
            unit="observations"
            icon={<Layers className="w-5 h-5" />}
            tooltip="Total number of validated operational records included in this dashboard view."
            isDemo={data.kpis.is_demo_data}
          />

          <MetricCard
            title="Period Trend"
            value={
              data.kpis.period_comparison_pct !== null && data.kpis.period_comparison_pct !== undefined
                ? `${data.kpis.period_comparison_pct > 0 ? '+' : ''}${data.kpis.period_comparison_pct}%`
                : 'N/A'
            }
            comparison={
              data.kpis.period_comparison_pct !== null && data.kpis.period_comparison_pct !== undefined
                ? { percentage: data.kpis.period_comparison_pct, label: 'previous month' }
                : undefined
            }
            icon={<TrendingUp className="w-5 h-5" />}
            tooltip="Percentage change in total emissions between the most recent sequential reporting months."
            isDemo={data.kpis.is_demo_data}
          />
        </div>
      )}

      {/* Main Charts Grid (Power BI style) */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Category Emissions Bar Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Emissions by Activity Category</h3>
                <p className="text-xs text-slate-500">Absolute carbon emissions in metric tonnes (tCO2e)</p>
              </div>
              <BarChart2 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-72 w-full">
              {data.category_emissions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.category_emissions} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: any) => [`${Number(val).toLocaleString()} tCO2e`, 'Emissions']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="emissions_tonnes" fill="#15803d" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No category records available for this filter.
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Category Donut Contribution */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Category Share Contribution (%)</h3>
                <p className="text-xs text-slate-500">Proportional breakdown of total measured footprint</p>
              </div>
              <PieIcon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-72 w-full">
              {data.category_percentages.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.category_percentages}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {data.category_percentages.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} kg CO2e`, name]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No data to compute distribution.
                </div>
              )}
            </div>
          </div>

          {/* Chart 3: Emissions Over Time (Monthly Trajectory) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Emissions Trajectory Over Time</h3>
                <p className="text-xs text-slate-500">Monthly trend across monitored facilities</p>
              </div>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-72 w-full">
              {data.emissions_over_time.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.emissions_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorEmiss" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#15803d" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: any) => [`${Number(val).toLocaleString()} tCO2e`, 'Monthly Total']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="emissions_tonnes"
                      stroke="#15803d"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEmiss)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No time series date entries found in current selection.
                </div>
              )}
            </div>
          </div>

          {/* Chart 4: Department / Facility Comparison */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Facility & Department Benchmark</h3>
                <p className="text-xs text-slate-500">Cross-department emissions distribution</p>
              </div>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-72 w-full">
              {data.department_comparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.department_comparison}
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      type="category"
                      dataKey="department"
                      tick={{ fontSize: 11, fill: '#475569' }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${Number(val).toLocaleString()} tCO2e`, 'Emissions']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="emissions_tonnes" fill="#0d9488" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No departmental records found.
                </div>
              )}
            </div>
          </div>

          {/* Chart 5: Emissions Histogram / Distribution */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Activity Intensity Distribution (Histogram)</h3>
                <p className="text-xs text-slate-500">Frequency of observation emissions across intensity bins</p>
              </div>
              <span className="text-xs text-slate-400 font-medium">Binned Spectrum</span>
            </div>

            <div className="h-56 w-full">
              {data.emissions_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.emissions_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} records`, 'Frequency']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#475569" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Insufficient data points to construct histogram.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
