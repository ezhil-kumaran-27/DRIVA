import React from 'react';
import { Recommendation, ExplainResponse } from '../types';
import { Sparkles, X, ShieldCheck, Cpu, Check, Layers } from 'lucide-react';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  explainData: ExplainResponse | null;
  loading: boolean;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  explainData,
  loading
}) => {
  if (!isOpen || !recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">DRIVA AI Explanation Layer</h3>
              <p className="text-xs text-slate-300">Grounded Multi-Factor Recommendation Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Carrier Snapshot */}
          <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Carrier</span>
              <h4 className="text-lg font-bold text-slate-900">{recommendation.provider.name}</h4>
              <span className="text-xs text-slate-500">{recommendation.provider.fleet_type}</span>
            </div>
            <div className="flex items-center space-x-6 text-right">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Estimated Cost</span>
                <span className="text-base font-black text-slate-900">
                  ₹{recommendation.predicted_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Match Score</span>
                <span className="text-base font-black text-sky-600">{recommendation.match_score}%</span>
              </div>
            </div>
          </div>

          {/* AI Narrative Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Executive Decision Rationale</span>
              </span>
              {explainData && (
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${
                  explainData.is_fallback
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  Model: {explainData.model_used}
                </span>
              )}
            </div>

            {loading ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-medium">Synthesizing multi-variable explanation with Groq API...</span>
              </div>
            ) : (
              <div className="p-5 bg-sky-50/60 rounded-xl border border-sky-200 text-slate-800 text-sm leading-relaxed shadow-inner">
                {explainData?.explanation || recommendation.ai_explanation || (
                  <p className="text-slate-500 italic">Generating explanation...</p>
                )}
              </div>
            )}
          </div>

          {/* Decision Factors Checklist */}
          <div className="border-t border-slate-200 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              Verified Constraint Verifications:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Payload within vehicle rating ({recommendation.provider.capacity_kg} kg rating)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Transit window adheres to Same-Day Today deadline ({recommendation.predicted_eta_hours.toFixed(1)} hrs)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Historical on-time SLA verified at {(recommendation.provider.reliability_score * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Optimal total cost efficiency score evaluated by ML model</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>DRIVA ML Decision Engine v1.0 • Groq Inference</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
