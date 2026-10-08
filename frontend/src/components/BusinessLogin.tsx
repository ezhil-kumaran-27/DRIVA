import React, { useState } from 'react';
import { api } from '../services/api';
import { AuthResponse } from '../types';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface BusinessLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthResponse) => void;
}

export const BusinessLogin: React.FC<BusinessLoginProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('business@driva.com');
  const [password, setPassword] = useState('driva123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api.login(email, password);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'business' | 'admin') => {
    if (role === 'business') {
      setEmail('business@driva.com');
      setPassword('driva123');
    } else {
      setEmail('admin@driva.com');
      setPassword('driva123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Enterprise Authentication</h2>
              <p className="text-xs text-slate-400">Sign in to DRIVA Logistics Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@enterprise.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
            <span className="font-semibold text-slate-700 block">Evaluation Demo Credentials:</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleQuickFill('business')}
                className="flex-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded border border-sky-200 font-medium text-center transition"
              >
                Business Manager (Demo)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 font-medium text-center transition"
              >
                Admin (Demo)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition disabled:opacity-60"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured with JWT & Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
};
