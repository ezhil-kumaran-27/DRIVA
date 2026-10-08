import React from 'react';
import { MatchResultResponse, Recommendation } from '../types';
import { CheckCircle2, Award, Clock, DollarSign, Shield, Zap, Sparkles, ArrowRight, Truck } from 'lucide-react';

interface RecommendationsViewProps {
  matchData: MatchResultResponse;
  onExplainClick: (rec: Recommendation) => void;
  onBookNowClick: (rec: Recommendation) => void;
  bookingLoading: boolean;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  matchData,
  onExplainClick,
  onBookNowClick,
  bookingLoading
}) => {
  const top = matchData.top_recommendation;
  const runnerUps = matchData.ranked_options.filter((r) => r.id !== top.id);

  return (
    <div className="space-y-6">
      {/* Shipment Summary Strip */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Active Route Evaluated</div>
            <div className="text-base font-bold text-white flex items-center space-x-2">
              <span>{matchData.origin}</span>
              <span className="text-sky-400">→</span>
              <span>{matchData.destination}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-[11px]">Payload Weight:</span>
            <span className="font-semibold text-white">{matchData.cargo_weight} kg</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Delivery Window:</span>
            <span className="font-semibold text-amber-300">{matchData.deadline}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Engine Status:</span>
            <span className="font-semibold text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Ranked 4 Providers</span>
            </span>
          </div>
        </div>
      </div>

      {/* TOP RECOMMENDED CARRIER HERO CARD */}
      <div className="bg-white rounded-xl border-2 border-sky-500 shadow-md overflow-hidden relative">
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm tracking-wide uppercase">DRIVA Recommended Provider (Rank #1)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold backdrop-blur-xs">
              Composite Decision Score
            </span>
            <span className="text-lg font-extrabold text-amber-300">{top.match_score}%</span>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{top.provider.name}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {top.provider.code}
                </span>
                {top.provider.is_ev && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    <span>Zero Emission EV</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Fleet Category: <span className="text-slate-700 font-medium">{top.provider.fleet_type}</span> • Rating: <span className="text-amber-600 font-bold">{top.provider.avg_rating} / 5.0</span> ({top.provider.total_trips} verified trips)
              </p>
            </div>

            {/* Price & ETA Highlight */}
            <div className="flex items-center space-x-6 sm:space-x-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Freight Cost</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  ₹{top.predicted_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Transit ETA</span>
                <span className="text-2xl sm:text-3xl font-black text-sky-600">
                  {top.predicted_eta_hours.toFixed(1)} <span className="text-base font-semibold">hrs</span>
                </span>
              </div>
            </div>
          </div>

          {/* Key Metric Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Rated Capacity</span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">{top.provider.capacity_kg.toLocaleString()} kg</span>
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Sufficient for 200kg</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Historical Reliability</span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">
                {(top.provider.reliability_score * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-sky-600 font-medium mt-0.5 block">Tier-1 On-Time SLA</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">ML Suitability Index</span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">{top.suitability_score.toFixed(1)} / 100</span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Optimal Class Match</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Decision Engine Score</span>
              <span className="text-base font-bold text-sky-700 mt-0.5 block">{top.match_score.toFixed(1)}%</span>
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Highest Weighted Rank</span>
            </div>
          </div>

          {/* AI Explanation Snippet preview */}
          {top.ai_explanation && (
            <div className="p-4 bg-sky-50/70 rounded-lg border border-sky-200/70 mb-6 text-xs text-sky-950 flex items-start space-x-3">
              <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-900 block mb-0.5">Groq AI Recommendation Narrative:</span>
                <p className="leading-relaxed text-slate-700">{top.ai_explanation}</p>
              </div>
            </div>
          )}

          {/* Action Buttons: "Why DRIVA recommended this" & "BOOK NOW" */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={() => onExplainClick(top)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Why DRIVA recommended this</span>
            </button>

            <button
              onClick={() => onBookNowClick(top)}
              disabled={bookingLoading}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-md transition disabled:opacity-60 cursor-pointer"
            >
              {bookingLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Reserving Dispatch in PostgreSQL...</span>
                </>
              ) : (
                <>
                  <span>BOOK NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RUNNER-UP CARRIERS COMPARISON TABLE */}
      {runnerUps.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Evaluated Alternative Carriers (Ranks #2 - #{matchData.ranked_options.length})
            </h4>
            <span className="text-[11px] text-slate-500">Ranked by Multi-Attribute Utility Function</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Logistics Provider</th>
                  <th className="py-3 px-4">Fleet / Powertrain</th>
                  <th className="py-3 px-4">Total Cost (₹)</th>
                  <th className="py-3 px-4">ETA (hrs)</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Reliability</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {runnerUps.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-500">#{r.rank}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.provider.name}</div>
                      <div className="text-[11px] text-slate-400">{r.provider.code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.provider.is_ev ? (
                        <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          <Zap className="w-3 h-3 mr-1 text-emerald-600" /> EV Electric
                        </span>
                      ) : (
                        <span>{r.provider.fleet_type}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{r.predicted_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">{r.predicted_eta_hours.toFixed(1)} hrs</td>
                    <td className="py-3.5 px-4">{r.provider.capacity_kg.toLocaleString()} kg</td>
                    <td className="py-3.5 px-4">{(r.provider.reliability_score * 100).toFixed(0)}%</td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-sky-700">{r.match_score.toFixed(1)}%</span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onExplainClick(r)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition"
                      >
                        Explain
                      </button>
                      <button
                        onClick={() => onBookNowClick(r)}
                        className="px-3 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition"
                      >
                        Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
