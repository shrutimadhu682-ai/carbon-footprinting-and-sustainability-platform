import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  LineChart,
  BrainCircuit,
  Lightbulb,
  FileSpreadsheet,
  Database,
  Info,
  Leaf,
  Home
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/calculator', label: 'Carbon Calculator', icon: Calculator },
  { path: '/analytics', label: 'Emission Analytics', icon: LineChart },
  { path: '/predictions', label: 'ML Predictions', icon: BrainCircuit },
  { path: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { path: '/reports', label: 'Reports', icon: FileSpreadsheet },
  { path: '/datasets', label: 'Dataset Management', icon: Database },
  { path: '/about', label: 'About Project', icon: Info },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-forest-50/50 via-white to-transparent">
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-forest-700 text-white flex items-center justify-center shadow-md shadow-forest-900/10 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-forest-200" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight flex items-center space-x-1">
                <span>Carbon</span>
                <span className="text-forest-600">Sphere</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                ESG & Carbon Intelligence
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-forest-700 text-white shadow-sm shadow-forest-900/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-forest-200' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom link to landing page */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Landing Page</span>
          </NavLink>
          <div className="mt-3 px-3 text-[10px] text-slate-400 leading-tight">
            Academic PBL Viva Project <br />
            BTech Engineering
          </div>
        </div>
      </aside>
    </>
  );
};
