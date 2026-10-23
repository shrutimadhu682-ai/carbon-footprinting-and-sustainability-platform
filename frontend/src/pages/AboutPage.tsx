import React from 'react';
import {
  Info,
  CheckCircle2,
  Code2,
  Workflow,
  Layers,
  GraduationCap,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-forest-800 to-emerald-950 text-white shadow-md space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest-700/60 border border-forest-500/40 text-forest-200 text-xs font-semibold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>BTech PBL Capstone Project & Viva Reference</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight leading-tight">
          Carbon Footprinting & Sustainability Platform
        </h1>
        <p className="text-sm text-forest-100 max-w-3xl leading-relaxed">
          An end-to-end full-stack software system designed to quantify, analyze, predict, and reduce carbon emissions across commercial, industrial, and individual activity sectors using verified greenhouse gas calculation methodologies and supervised machine learning pipelines.
        </p>
      </div>

      {/* Project Motivation & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-base">
            <Compass className="w-5 h-5 text-forest-700" />
            <h3>Project Motivation</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Climate change demands that organizations shift from retrospective accounting to continuous telemetry and forward-looking forecasting. Raw utility bills and travel receipts contain latent environmental insights that require standardized conversion factors, outlier audits, and automated Machine Learning modeling to inform actionable decarbonization policies.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-base">
            <ShieldCheck className="w-5 h-5 text-forest-700" />
            <h3>Core Engineering Objectives</h3>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Quantify emissions across Scope 1, Scope 2, and Scope 3 activity domains.</li>
            <li>Implement regional emission factor registries (India CEA, US EPA, UK DEFRA).</li>
            <li>Execute a 10-stage data processing and outlier detection pipeline.</li>
            <li>Train and evaluate regression models with held-out test splits.</li>
            <li>Deliver an interactive Power BI-style dashboard with KPI drilldowns.</li>
            <li>Generate rule-based sustainability recommendations and What-If scenario models.</li>
          </ul>
        </div>
      </div>

      {/* Technical Workflow Pipeline (8 stages) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Workflow className="w-5 h-5 text-forest-700" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">End-to-End Technical Workflow Pipeline</h3>
            <p className="text-xs text-slate-500">The 8 sequential architectural phases from ingestion to decision support</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'Secure CSV upload, MIME verification, UUID sanitization' },
            { step: '02', title: 'Data Cleaning', desc: 'Duplicate detection, missing value imputation, type validation' },
            { step: '03', title: 'Exploratory EDA', desc: 'IQR outlier detection, descriptive statistics, Pearson matrix' },
            { step: '04', title: 'GHG Standard Calc', desc: 'Activity × Documented Factor in kg CO2e & tonnes' },
            { step: '05', title: 'ML Pipeline', desc: 'StandardScaler, OneHotEncoder, Random Forest/GBR regression' },
            { step: '06', title: 'FastAPI Backend', desc: 'RESTful API endpoints, Pydantic validation, SQLite ORM' },
            { step: '07', title: 'Power BI Dashboard', desc: 'Recharts KPI cards, trend lines, donut breakdowns, filters' },
            { step: '08', title: 'Actionable Insights', desc: 'Rule-driven recommendations, What-If simulator, action plans' },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-mono font-bold text-forest-700">{item.step}</span>
              <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Code2 className="w-5 h-5 text-forest-700" />
          <h3 className="font-bold text-slate-900 text-base">Technology Stack & Libraries</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-forest-800 uppercase tracking-wider text-[11px] block">Frontend Client</span>
            <ul className="space-y-1 text-slate-600">
              <li><strong>React 19 & TypeScript:</strong> Type-safe UI components</li>
              <li><strong>Vite:</strong> Next-generation blazing fast build tool</li>
              <li><strong>Tailwind CSS:</strong> Custom Forest/Sage ESG theme</li>
              <li><strong>Recharts:</strong> Interactive SVG charts & scatter plots</li>
              <li><strong>Lucide React:</strong> Consistent modern iconography</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-forest-800 uppercase tracking-wider text-[11px] block">Backend Server</span>
            <ul className="space-y-1 text-slate-600">
              <li><strong>FastAPI & Uvicorn:</strong> High-performance async REST API</li>
              <li><strong>Pydantic v2:</strong> Strict request/response schema validation</li>
              <li><strong>SQLAlchemy 2:</strong> Python SQL toolkit and ORM</li>
              <li><strong>SQLite:</strong> Embedded persistent relational database</li>
              <li><strong>Pytest:</strong> Comprehensive automated testing suite</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-forest-800 uppercase tracking-wider text-[11px] block">Data Science & ML</span>
            <ul className="space-y-1 text-slate-600">
              <li><strong>Pandas 3:</strong> High-speed tabular manipulation</li>
              <li><strong>NumPy 2:</strong> Vectorized matrix math & histograms</li>
              <li><strong>Scikit-learn 1.8:</strong> ColumnTransformers, Pipelines</li>
              <li><strong>Algorithms:</strong> Random Forest, GBR, Linear, K-Means</li>
              <li><strong>Joblib:</strong> Model serialization & persistence</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Implemented vs Future Work Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Implemented Features vs. Future Extensions</h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3">Implemented Capabilities</th>
                <th className="py-2.5 px-3">Planned Future Enhancements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Carbon Calculator</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 text-[10px]">
                    100% Implemented
                  </span>
                </td>
                <td className="py-3 px-3">Electricity, transport, fuel, waste, regional CEA/DEFRA factors, SQLite history, CSV export.</td>
                <td className="py-3 px-3 text-slate-400">Direct utility smart-meter API webhooks.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Data Analytics</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 text-[10px]">
                    100% Implemented
                  </span>
                </td>
                <td className="py-3 px-3">10-stage Pandas pipeline, field mapping, IQR outlier detection, Pearson matrix.</td>
                <td className="py-3 px-3 text-slate-400">Automated OCR for scanning paper electricity bills.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">ML Predictions</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 text-[10px]">
                    100% Implemented
                  </span>
                </td>
                <td className="py-3 px-3">Random Forest, Gradient Boosting, Linear Regression, real MAE/RMSE/R², K-Means clustering.</td>
                <td className="py-3 px-3 text-slate-400">Deep Learning LSTM temporal sequence forecasting.</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Dashboard & Reporting</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 text-[10px]">
                    100% Implemented
                  </span>
                </td>
                <td className="py-3 px-3">Power BI-style KPI cards, filters, Recharts charts, printable PDF, CSV export.</td>
                <td className="py-3 px-3 text-slate-400">Direct Microsoft Power BI Embedded iframe token connector.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
