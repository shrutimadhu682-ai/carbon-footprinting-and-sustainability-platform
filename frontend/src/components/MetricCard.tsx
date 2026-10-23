import React, { useState } from 'react';
import { HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  comparison?: {
    percentage: number;
    label: string;
  };
  tooltip: string;
  isDemo?: boolean;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  comparison,
  tooltip,
  isDemo,
  highlight,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`relative p-5 rounded-2xl bg-white border transition-all duration-200 shadow-sm hover:shadow-md ${
        highlight ? 'border-forest-500/40 bg-gradient-to-br from-forest-50/50 to-white' : 'border-slate-200/80'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700 border border-forest-100 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  aria-label="Info"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                {showTooltip && (
                  <div className="absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none leading-relaxed">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                  </div>
                )}
              </div>
            </div>
            {isDemo && (
              <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded">
                Demo Data
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
          {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
        </div>

        {comparison && (
          <div
            className={`flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              comparison.percentage > 0
                ? 'bg-rose-50 text-rose-700'
                : comparison.percentage < 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {comparison.percentage > 0 ? (
              <TrendingUp className="w-3 h-3 text-rose-600" />
            ) : comparison.percentage < 0 ? (
              <TrendingDown className="w-3 h-3 text-emerald-600" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>
              {comparison.percentage > 0 ? `+${comparison.percentage}%` : `${comparison.percentage}%`}
            </span>
          </div>
        )}
      </div>

      {comparison && (
        <p className="mt-2 text-[11px] text-slate-400 truncate">
          vs. {comparison.label}
        </p>
      )}
    </div>
  );
};
