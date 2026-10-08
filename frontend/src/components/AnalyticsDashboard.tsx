import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AnalyticsDashboard as AnalyticsType } from '../types';
import { TrendingUp, TrendingDown, ShieldCheck, Zap, Award, BarChart3, Route } from 'lucide-react';

export const AnalyticsDashboardView: React.FC = () => {
  const [data, setData] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Aggregating supply chain operational telemetry...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Logistics Intelligence</h2>
          <p className="text-xs text-slate-500">
            Real-time supply chain KPIs, carrier scorecards & ESG emissions tracking
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PostgreSQL Live Sync</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              {kpi.title}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</div>
            <div className="flex items-center space-x-1.5 text-[11px] mt-2 font-medium">
              {kpi.trend === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-sky-600" />
              )}
              <span className={kpi.trend === 'up' ? 'text-emerald-700' : 'text-sky-700'}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Provider Scorecards & Corridor Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Scorecards (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Award className="w-4 h-4 text-sky-600" />
              <span>Carrier Performance & Reliability Index</span>
            </h3>
            <span className="text-[11px] text-slate-500">Calculated from Trip Telemetry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Carrier Partner</th>
                  <th className="py-3 px-4">Fleet Type</th>
                  <th className="py-3 px-4">On-Time SLA</th>
                  <th className="py-3 px-4">Completed Trips</th>
                  <th className="py-3 px-4">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {data.provider_scorecards.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4">
                      {p.is_ev ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold text-[11px] inline-flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-emerald-600" /> EV
                        </span>
                      ) : (
                        <span>Standard Commercial</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${p.on_time_rate}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-800">{p.on_time_rate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800">{p.total_trips} trips</td>
                    <td className="py-3 px-4 text-amber-600 font-bold">{p.avg_rating} / 5.0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Routes (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Route className="w-4 h-4 text-indigo-600" />
              <span>Corridor Efficiency</span>
            </h3>
            <span className="text-[11px] text-slate-500">Benchmark</span>
          </div>

          <div className="p-4 space-y-3 flex-1 flex flex-col justify-around">
            {data.top_routes.map((rt, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>{rt.route}</span>
                  <span className="text-slate-500 text-[11px]">{rt.trips} dispatches</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                  <span>Avg Cost: <strong className="text-slate-800">₹{rt.avg_cost.toLocaleString()}</strong></span>
                  <span>Avg Transit: <strong className="text-sky-700">{rt.avg_eta_hours}h</strong></span>
                </div>
              </div>
            ))}

            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-950 mt-2">
              <span className="font-bold block mb-1">ESG Footprint Impact</span>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                DRIVA route optimization and EV prioritization avoided approximately{' '}
                <strong>{data.carbon_saved_kg} kg CO₂</strong> emissions across corridor operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
