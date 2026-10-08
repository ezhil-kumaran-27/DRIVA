import React, { useState } from 'react';
import { api } from '../services/api';
import { MatchResultResponse } from '../types';
import { MapPin, Weight, Clock, Layers, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface CreateRequestFormProps {
  onSuccess: (data: MatchResultResponse) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
}

export const CreateRequestForm: React.FC<CreateRequestFormProps> = ({
  onSuccess,
  loading,
  setLoading
}) => {
  const [origin, setOrigin] = useState('Salem');
  const [destination, setDestination] = useState('Bangalore');
  const [cargoWeight, setCargoWeight] = useState<number>(200);
  const [cargoType, setCargoType] = useState('Precision Industrial Components');
  const [deadline, setDeadline] = useState('Today');
  const [specialReqs, setSpecialReqs] = useState('Handle with care, moisture protection required');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await api.createTransportRequest({
        origin,
        destination,
        cargo_weight: Number(cargoWeight),
        cargo_type: cargoType,
        deadline,
        special_requirements: specialReqs
      });
      onSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch matching request');
    } finally {
      setLoading(false);
    }
  };

  const setTestScenario = () => {
    setOrigin('Salem');
    setDestination('Bangalore');
    setCargoWeight(200);
    setDeadline('Today');
    setCargoType('Precision Auto Components');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create Transport Dispatch Request</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Triggers ML Cost/ETA models, DRIVA Multi-Attribute Decision Engine & Groq AI explanation
          </p>
        </div>
        <button
          type="button"
          onClick={setTestScenario}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200 transition flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Load E2E Test (Salem → Bangalore, 200kg)</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Origin */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pickup Origin
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Salem"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Salem Logistics Industrial Park</span>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Drop Destination
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Electronic City / Whitefield, Bangalore</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Cargo Weight */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Cargo Weight (kg)
            </label>
            <div className="relative">
              <Weight className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                min="1"
                required
                value={cargoWeight}
                onChange={(e) => setCargoWeight(Number(e.target.value))}
                placeholder="200"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-semibold"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Net payload capacity rating</span>
          </div>

          {/* Cargo Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Cargo Classification
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium bg-white"
              >
                <option value="Precision Auto Components">Precision Auto Components</option>
                <option value="General Merchandise">General Merchandise</option>
                <option value="Consumer Electronics">Consumer Electronics</option>
                <option value="Pharmaceuticals">Pharmaceuticals (Temperature Regulated)</option>
                <option value="Industrial Machinery">Industrial Machinery Parts</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Delivery Deadline
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
              <select
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium bg-white"
              >
                <option value="Today">Today (Same-Day Express)</option>
                <option value="Tomorrow Morning">Tomorrow Morning (Within 18 hrs)</option>
                <option value="Within 48 Hours">Standard (Within 48 Hours)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Dispatch Instructions / Constraints
          </label>
          <input
            type="text"
            value={specialReqs}
            onChange={(e) => setSpecialReqs(e.target.value)}
            placeholder="Special freight handling requirements..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-600"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Executing ML Models & Multi-Attribute Decision Engine...</span>
              </>
            ) : (
              <>
                <span>Calculate Optimal Carriers & Match Scores</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
