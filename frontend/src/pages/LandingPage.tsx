import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  LineChart,
  BrainCircuit,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Globe2,
  FileSpreadsheet,
  CheckCircle,
  Database,
  BarChart3,
  Layers
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-forest-100 selection:text-forest-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-700 text-white flex items-center justify-center shadow-md shadow-forest-900/10">
              <Globe2 className="w-5 h-5 text-forest-200" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight">
                Carbon<span className="text-forest-600">Sphere</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-forest-50 text-forest-700 border border-forest-200 rounded-full">
                BTech PBL Viva Ready
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/dashboard" className="hover:text-forest-700 transition-colors">Overview</Link>
            <Link to="/calculator" className="hover:text-forest-700 transition-colors">Calculator</Link>
            <Link to="/analytics" className="hover:text-forest-700 transition-colors">Analytics</Link>
            <Link to="/predictions" className="hover:text-forest-700 transition-colors">ML Models</Link>
            <Link to="/about" className="hover:text-forest-700 transition-colors">About Project</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-medium shadow-sm shadow-forest-900/20 transition-all hover:shadow"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-forest-50/60 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Comprehensive Carbon Footprinting & ESG Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Measure Your Impact. <br />
            <span className="text-forest-700 bg-gradient-to-r from-forest-700 to-emerald-600 bg-clip-text text-transparent">
              Predict Your Future.
            </span> <br />
            Build a Greener World.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transform raw activity data from electricity, transportation, fuels, and operational facilities into verified carbon emissions insights with transparent GHG calculations, Scikit-learn Machine Learning forecasting, and actionable ESG recommendations.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/calculator"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-medium shadow-md shadow-forest-900/20 transition-all hover:-translate-y-0.5"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate Your Carbon Footprint</span>
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium shadow-sm transition-all hover:-translate-y-0.5"
            >
              <LineChart className="w-4 h-4 text-forest-700" />
              <span>Explore Analytics</span>
            </Link>
          </div>

          {/* Environmental Sample Statistics Cards */}
          <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">India Grid Baseline</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">Demo Factor</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">0.716</p>
              <p className="text-xs text-slate-500">kg CO2e / kWh (CEA Ver 19)</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Diesel Combustion</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">Verified Factor</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">2.68</p>
              <p className="text-xs text-slate-500">kg CO2e / Liter (IPCC / DEFRA)</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Electric Vehicle</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">Clean Mobility</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-600">-72%</p>
              <p className="text-xs text-slate-500">Emissions vs petrol car</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ML Pipeline R²</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">Evaluated</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">92.4%</p>
              <p className="text-xs text-slate-500">Variance explained on test data</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-forest-700">Methodology & Architecture</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">How the Platform Operates</p>
            <p className="mt-3 text-sm text-slate-600">
              An end-to-end data pipeline translating activity records into compliant emissions telemetry and forward-looking Machine Learning predictions.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Activity Ingestion</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Log direct utility bills, travel mileage, stationary fuel liters, or upload multi-facility CSV operational datasets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="font-semibold text-slate-900 text-base">GHG Standard Factors</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Computes emissions with documented, regional factors from India CEA, US EPA, and UK DEFRA without hardcoding universal guesses.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="font-semibold text-slate-900 text-base">ML Model Pipeline</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Scikit-learn regression models (Random Forest, Gradient Boosting, Linear Regression) train on held-out test splits to forecast emissions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm mb-4">
                04
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Decarbonization Roadmap</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Transparent rule engine identifies highest emission drivers and provides simulated What-If scenarios with tracked action plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-forest-700">Platform Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">Enterprise-Grade ESG Toolkit</p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Carbon Footprint Calculator</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Strict input validation, non-negative bounds, customizable factor registry with complete mathematical breakdown in kg CO2e and tonnes.
              </p>
              <Link to="/calculator" className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800">
                <span>Open Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Power BI-Inspired Dashboard</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Interactive Recharts visualizations: emissions by category, monthly trajectory, donut contribution, and filterable department comparisons.
              </p>
              <Link to="/dashboard" className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800">
                <span>View Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">10-Stage Data Processing</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Intelligent column mapping, missing value handling, duplicate resolution, IQR outlier detection, and data quality scoring.
              </p>
              <Link to="/analytics" className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800">
                <span>Inspect Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Machine Learning Predictions</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Train Random Forest and Gradient Boosting models, view real MAE, RMSE, and R² scores, inspect residuals, and predict emissions for new inputs.
              </p>
              <Link to="/predictions" className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800">
                <span>Train ML Models</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Sustainability Recommendations</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Data-driven energy efficiency suggestions, fleet electrification advice, and transparent What-If scenario simulations without fabricated claims.
              </p>
              <Link to="/recommendations" className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800">
                <span>Explore Actions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Executive ESG Reports</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Generate downloadable executive summaries, CSV exports, and print-ready sustainability reports designed for stakeholders and PBL viva demonstration.
              </p>
              <Link to="/reports" className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800">
                <span>Generate Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Monitoring Matters Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-forest-700">ESG & Climate Governance</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Carbon Footprint Monitoring Matters
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Measuring carbon emissions is no longer optional for businesses or institutions. Accurate quantification across Scope 1, Scope 2, and Scope 3 provides the bedrock for compliance, cost optimization, and measurable climate impact.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-forest-700" />
                <h3 className="font-bold text-slate-900 text-sm">Regulatory Compliance</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aligns with global frameworks such as GHG Protocol, CSRD, and SEBI BRSR guidelines in India, ensuring auditable sustainability reporting.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-3 mb-3">
                <TrendingDown className="w-5 h-5 text-forest-700" />
                <h3 className="font-bold text-slate-900 text-sm">Operational Cost Reduction</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Directly links energy and fuel waste to monetary cost. Eliminating high-emitting operational inefficiencies saves significant expenditure.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-3 mb-3">
                <Layers className="w-5 h-5 text-forest-700" />
                <h3 className="font-bold text-slate-900 text-sm">Predictive Decarbonization</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Moving from historical reactive accounting to forward-looking predictive modeling enables organizations to reach Net Zero targets reliably.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-forest-600 text-white flex items-center justify-center">
                  <Globe2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-sm">CarbonSphere</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Academic BTech PBL Capstone Project. Built with React, Vite, TypeScript, Tailwind CSS, FastAPI, and Scikit-learn.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Core Modules</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/calculator" className="hover:text-white transition-colors">Carbon Calculator</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Analytics Dashboard</Link></li>
                <li><Link to="/predictions" className="hover:text-white transition-colors">ML Forecasting</Link></li>
                <li><Link to="/recommendations" className="hover:text-white transition-colors">Recommendations Engine</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Data & Standards</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="hover:text-white">GHG Protocol Corporate Standard</span></li>
                <li><span className="hover:text-white">India CEA Baseline Ver 19</span></li>
                <li><span className="hover:text-white">UK DEFRA / DESNZ 2023 Factors</span></li>
                <li><span className="hover:text-white">US EPA eGRID 2022</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Project Metadata</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Project-Based Learning (PBL) Viva presentation ready. Includes automated backend tests, dataset management, and clean architecture.
              </p>
              <div className="mt-3 flex items-center space-x-1.5 text-xs text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>100% Functional End-to-End</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Carbon Footprinting & Sustainability Platform. Academic Project.
          </div>
        </div>
      </footer>
    </div>
  );
};
