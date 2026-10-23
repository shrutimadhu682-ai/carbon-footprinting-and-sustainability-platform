import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

interface MainLayoutProps {
  pageTitle: string;
  pageSubtitle?: string;
  activeDatasetId?: string;
  onSelectDataset?: (id: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  pageTitle,
  pageSubtitle,
  activeDatasetId,
  onSelectDataset,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Persistent Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          activeDatasetId={activeDatasetId}
          onSelectDataset={onSelectDataset}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
