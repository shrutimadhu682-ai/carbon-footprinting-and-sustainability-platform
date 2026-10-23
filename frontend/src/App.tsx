import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DatasetManagementPage } from './pages/DatasetManagementPage';
import { AboutPage } from './pages/AboutPage';
import { MainLayout } from './layouts/MainLayout';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [activeDatasetId, setActiveDatasetId] = useState<string>('');

  const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
    switch (pathname) {
      case '/dashboard':
        return {
          title: 'Emission Overview & KPI Dashboard',
          subtitle: 'Interactive Power BI-style carbon intelligence telemetry',
        };
      case '/calculator':
        return {
          title: 'Carbon Footprint Calculator',
          subtitle: 'Quantify emissions across electricity, transport, fuel, and facilities',
        };
      case '/analytics':
        return {
          title: '10-Stage Data Processing & Analytics',
          subtitle: 'Configurable column mapping, outlier audits, and statistical decomposition',
        };
      case '/predictions':
        return {
          title: 'Machine Learning Forecasting & Clustering',
          subtitle: 'Train regression models and explore activity archetypes with Scikit-learn',
        };
      case '/recommendations':
        return {
          title: 'Sustainability Decarbonization Roadmap',
          subtitle: 'Data-driven interventions, What-If simulator, and evaluation action plans',
        };
      case '/reports':
        return {
          title: 'Executive ESG Disclosure Reports',
          subtitle: 'Official greenhouse gas performance summaries and exportable audits',
        };
      case '/datasets':
        return {
          title: 'Dataset Management & Ingestion',
          subtitle: 'Upload CSV datasets, validate schema, and download templates',
        };
      case '/about':
        return {
          title: 'About CarbonSphere & Technical Architecture',
          subtitle: 'Academic BTech PBL Capstone Project & Viva Reference Guide',
        };
      default:
        return { title: 'CarbonSphere ESG Platform', subtitle: 'Carbon Intelligence & Sustainability' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Authenticated / App Workspace Routes */}
      <Route
        element={
          <MainLayout
            pageTitle={title}
            pageSubtitle={subtitle}
            activeDatasetId={activeDatasetId}
            onSelectDataset={(id) => setActiveDatasetId(id)}
          />
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/datasets" element={<DatasetManagementPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
