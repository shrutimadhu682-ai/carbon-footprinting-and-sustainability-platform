import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sliders,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { RecommendationItem, ActionPlan, ScenarioResult } from '../types';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Scenario Simulator State
  const [baselineKg, setBaselineKg] = useState<number>(50000);
  const [reductionPct, setReductionPct] = useState<number>(20);
  const [scenarioCategory, setScenarioCategory] = useState<string>('Electricity');
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recs, plans] = await Promise.all([
        api.getRecommendations(),
        api.getActionPlans(),
      ]);
      setRecommendations(recs);
      setActionPlans(plans);

      // Trigger initial simulation
      const initialSim = await api.simulateScenario({
        baseline_emissions_kg: baselineKg,
        reduction_percentage: reductionPct,
        category: scenarioCategory,
        interventions: ['LED retrofits', 'HVAC optimization', 'Rooftop solar PPA'],
      });
      setScenarioResult(initialSim);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (pct: number) => {
    setReductionPct(pct);
    setSimulating(true);
    try {
      const res = await api.simulateScenario({
        baseline_emissions_kg: baselineKg,
        reduction_percentage: pct,
        category: scenarioCategory,
        interventions: ['Operational efficiency'],
      });
      setScenarioResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleSaveToActionPlan = async (rec: RecommendationItem) => {
    try {
      const plan = await api.createActionPlan({
        recommendation_id: rec.id,
        category: rec.category,
        title: rec.title,
        description: rec.recommended_action,
        potential_impact: rec.impact_level,
        target_date: 'Q3 2024',
        notes: `Adopted from recommendation: ${rec.reason}`,
      });
      setActionPlans((prev) => [plan, ...prev]);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, is_saved: true } : r))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to save action plan');
    }
  };

  const handleDeleteActionPlan = async (planId: string) => {
    try {
      await api.deleteActionPlan(planId);
      setActionPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete action plan');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-forest-700" />
            <h2 className="text-base font-bold text-slate-900">Decarbonization Roadmap & Recommendations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based suggestions derived from observed activity metrics and interactive What-If scenario simulations.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Targeted Strategic Opportunities</h3>
          <span className="text-xs text-slate-400 font-medium">
            {recommendations.length} data-driven recommendations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isSaved = actionPlans.some((p) => p.recommendation_id === rec.id) || rec.is_saved;
            return (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-forest-500/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-forest-50 text-forest-700 border border-forest-200 rounded-md">
                      {rec.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        rec.impact_level === 'High'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rec.impact_level} Impact
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{rec.title}</h4>

                  {/* Fact / Trigger */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Observed Metric:</span>
                    <p className="font-medium text-slate-800">{rec.reason}</p>
                  </div>

                  {/* Suggested Action */}
                  <div className="text-xs text-slate-600 pt-1 leading-relaxed">
                    <span className="font-bold text-slate-700 block mb-0.5">Actionable Intervention:</span>
                    {rec.recommended_action}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Urgency: {rec.urgency}</span>
                  </span>

                  <button
                    type="button"
                    disabled={isSaved}
                    onClick={() => handleSaveToActionPlan(rec)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSaved
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-forest-700 hover:bg-forest-800 text-white shadow-xs'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-forest-600" />
                        <span>In Evaluation Plan</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Action Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive What-If Scenario Simulator */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Sliders className="w-5 h-5 text-forest-700" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Interactive What-If Scenario Simulator</h3>
            <p className="text-xs text-slate-500">
              Simulate hypothetical decarbonization outcomes by applying target reduction percentages to operational categories.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Target Emission Reduction Percentage</span>
                <span className="text-forest-700 font-bold">{reductionPct}% Reduction</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={reductionPct}
                onChange={(e) => handleSimulate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-forest-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1% (Minor tweak)</span>
                <span>30% (Standard SBTi)</span>
                <span>60% (Aggressive Net Zero)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Category</label>
                <select
                  value={scenarioCategory}
                  onChange={(e) => setScenarioCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                >
                  <option value="Electricity">Electricity Operations</option>
                  <option value="Transportation">Transport Fleet</option>
                  <option value="Fuel">Stationary Fuels</option>
                  <option value="Facility Operations">Operational Waste/Water</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Baseline Emissions (kg)</label>
                <input
                  type="number"
                  value={baselineKg}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 0;
                    setBaselineKg(v);
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Projection Cards (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {scenarioResult && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-forest-50/50 to-white border border-forest-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Hypothetical Savings
                    </span>
                    <div className="text-2xl font-bold text-forest-700 mt-1">
                      {scenarioResult.hypothetical_savings_kg.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-slate-500">kg CO2e avoided</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Projected Footprint
                    </span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {scenarioResult.projected_emissions_kg.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-slate-500">kg CO2e remaining</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-[11px] text-slate-500 leading-relaxed border-t border-forest-100 pt-3">
                  <Info className="w-4 h-4 flex-shrink-0 text-forest-700 mt-0.5" />
                  <p>{scenarioResult.disclaimer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Action Plans Evaluation Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Adopted Decarbonization Action Plans</h3>
            <p className="text-xs text-slate-500">
              Track strategic interventions under active organizational evaluation ({actionPlans.length} items)
            </p>
          </div>
        </div>

        {actionPlans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Intervention Title</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Impact</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Target Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {actionPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-semibold text-forest-800">{plan.category}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{plan.title}</td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-500">{plan.description}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800">
                        {plan.potential_impact}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono capitalize">{plan.status}</td>
                    <td className="py-3 px-3 font-mono">{plan.target_date || 'Q3 2024'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteActionPlan(plan.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Remove plan"
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
          <div className="py-6 text-center text-xs text-slate-400">
            No action plans recorded yet. Click "Add to Action Plan" on any recommendation above to track feasibility.
          </div>
        )}
      </div>
    </div>
  );
};
