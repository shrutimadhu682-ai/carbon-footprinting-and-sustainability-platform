import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Zap,
  Car,
  Fuel,
  Building,
  CheckCircle2,
  Trash2,
  Download,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import {
  CalculationCategory,
  EmissionRegistry,
  CalculationResult,
  FactorDetail
} from '../types';

export const CalculatorPage: React.FC = () => {
  const [categories, setCategories] = useState<CalculationCategory[]>([]);
  const [registry, setRegistry] = useState<EmissionRegistry>({});
  const [selectedCatKey, setSelectedCatKey] = useState<string>('electricity');
  const [selectedSubcatKey, setSelectedSubcatKey] = useState<string>('');
  const [activityAmount, setActivityAmount] = useState<string>('1000');
  const [customFactor, setCustomFactor] = useState<string>('');
  const [region, setRegion] = useState<string>('India');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load registry and calculation history
  useEffect(() => {
    api.getCategories()
      .then((res) => {
        setCategories(res.categories);
        setRegistry(res.registry);
        if (res.registry['electricity']) {
          const firstSub = Object.keys(res.registry['electricity'].subcategories)[0];
          setSelectedSubcatKey(firstSub);
        }
      })
      .catch((err) => setError(err.message));

    loadHistory();
  }, []);

  const loadHistory = () => {
    api.getCalculations(0, 50)
      .then((res) => setHistory(res.items))
      .catch(() => {});
  };

  const handleCategoryChange = (key: string) => {
    setSelectedCatKey(key);
    if (registry[key]) {
      const subKeys = Object.keys(registry[key].subcategories);
      if (subKeys.length > 0) {
        setSelectedSubcatKey(subKeys[0]);
        setRegion(registry[key].subcategories[subKeys[0]].region || 'Global');
      }
    }
  };

  const currentCat = registry[selectedCatKey];
  const currentSub: FactorDetail | undefined = currentCat?.subcategories[selectedSubcatKey];

  const handleSubcategoryChange = (key: string) => {
    setSelectedSubcatKey(key);
    const sub = currentCat?.subcategories[key];
    if (sub) {
      setRegion(sub.region || 'Global');
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(activityAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid, strictly positive activity amount (> 0).');
      return;
    }

    const customNum = customFactor ? parseFloat(customFactor) : null;
    if (customFactor && (isNaN(customNum!) || customNum! < 0)) {
      setError('Custom emission factor must be non-negative (>= 0).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.calculate({
        category: selectedCatKey,
        subcategory: selectedSubcatKey,
        activity_amount: amountNum,
        custom_factor: customNum,
        region: region,
        notes: notes || undefined,
      });
      setCalcResult(res);
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await api.deleteCalculation(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (calcResult?.id === id) {
        setCalcResult(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete record');
    }
  };

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'electricity':
        return <Zap className="w-4 h-4" />;
      case 'transportation':
        return <Car className="w-4 h-4" />;
      case 'fuel':
        return <Fuel className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {categories.map((cat) => {
          const isActive = cat.key === selectedCatKey;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategoryChange(cat.key)}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-forest-700 text-white shadow-sm shadow-forest-900/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {getCategoryIcon(cat.key)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form and Breakdown Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Calculator className="w-5 h-5 text-forest-700" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {currentCat?.name || 'Emission Calculation'}
                </h2>
                <p className="text-xs text-slate-500">{currentCat?.description}</p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-2.5 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCalculate} className="space-y-4">
              {/* Activity / Emission Factor Subcategory */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Activity / Emission Factor Source
                </label>
                <select
                  value={selectedSubcatKey}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-forest-500"
                >
                  {currentCat &&
                    Object.entries(currentCat.subcategories).map(([subKey, sub]) => (
                      <option key={subKey} value={subKey}>
                        {sub.name} — {sub.factor} {sub.unit} ({sub.region})
                      </option>
                    ))}
                </select>
              </div>

              {/* Activity Amount Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Activity Amount <span className="text-forest-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      required
                      value={activityAmount}
                      onChange={(e) => setActivityAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-16 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-500"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      {currentCat?.unit}
                    </div>
                  </div>
                </div>

                {/* Region Context */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Geographic Region
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. India, US, Global"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-500"
                  />
                </div>
              </div>

              {/* Custom Emission Factor Override (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Custom Emission Factor Override (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Default: {currentSub?.factor} {currentSub?.unit}
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={customFactor}
                  onChange={(e) => setCustomFactor(e.target.value)}
                  placeholder={`Leave blank to use default factor (${currentSub?.factor})`}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              {/* Context Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Context / Operational Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Headquarters main server power, January utility bill"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  <Calculator className="w-4 h-4" />
                  <span>{loading ? 'Calculating...' : 'Compute & Save Emissions'}</span>
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
              <p>
                Calculations strictly follow GHG Protocol Corporate Standard. Results depend on the accuracy of your activity consumption data and applicable regional emission factors.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Breakdown Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {calcResult ? (
            <div className="p-6 rounded-2xl bg-white border border-forest-500/30 bg-gradient-to-br from-forest-50/40 via-white to-white shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-forest-100 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-forest-700" />
                  <h3 className="font-bold text-slate-900 text-sm">Calculation Verified</h3>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-forest-100 text-forest-800 rounded-full">
                  GHG Protocol
                </span>
              </div>

              {/* Results numbers */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Emissions
                  </span>
                  <div className="mt-1 flex items-baseline space-x-1">
                    <span className="text-2xl font-extrabold text-forest-800">
                      {calcResult.emissions_kg_co2e.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500">kg CO2e</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Metric Tonnes
                  </span>
                  <div className="mt-1 flex items-baseline space-x-1">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {calcResult.emissions_tonnes_co2e.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500">tCO2e</span>
                  </div>
                </div>
              </div>

              {/* Formula & Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mathematical Breakdown
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed break-all">
                  {calcResult.breakdown?.formula}
                </div>

                <div className="text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Activity Type:</span>
                    <span className="font-medium text-slate-800">{calcResult.activity_type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Emission Factor:</span>
                    <span className="font-medium text-slate-800">
                      {calcResult.emission_factor} {calcResult.emission_factor_unit}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Region:</span>
                    <span className="font-medium text-slate-800">{calcResult.region}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-500 leading-normal">
                    {calcResult.source_notes}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[300px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Formula & Citation Breakdown</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Submit an activity calculation on the left to see the transparent mathematical steps, verified emission factor citations, and carbon equivalence metrics.
              </p>
            </div>
          )}

          {/* Reference Factor Citation Card */}
          {currentSub && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                <BookOpen className="w-4 h-4 text-forest-700" />
                <span>Factor Source Reference</span>
              </div>
              <p className="text-slate-600 font-medium">{currentSub.source}</p>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span>Ref Year: {currentSub.reference_year}</span>
                <span>•</span>
                <span>Region: {currentSub.region}</span>
              </div>
              {currentSub.notes && (
                <p className="text-[11px] text-slate-500 italic pt-1">{currentSub.notes}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Persistent Calculation History Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Calculation History</h3>
            <p className="text-xs text-slate-500">
              Persisted calculation submissions stored in SQLite database ({history.length} records)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={api.getCalculationExportUrl()}
              download
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-forest-700" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Activity Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Emission Factor</th>
                  <th className="py-2.5 px-3">Emissions (kg CO2e)</th>
                  <th className="py-2.5 px-3">Tonnes (tCO2e)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.category}</td>
                    <td className="py-3 px-3">{item.activity_type}</td>
                    <td className="py-3 px-3 font-medium">
                      {item.activity_amount} {item.activity_unit}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {item.emission_factor} {item.emission_factor_unit}
                    </td>
                    <td className="py-3 px-3 font-bold text-forest-800">
                      {item.emissions_kg_co2e.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {item.emissions_tonnes_co2e.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No calculations recorded yet. Complete a calculation above to save your first entry.
          </div>
        )}
      </div>
    </div>
  );
};
