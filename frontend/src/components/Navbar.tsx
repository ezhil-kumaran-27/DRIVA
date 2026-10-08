import React from 'react';
import { AuthResponse } from '../types';
import { Truck, Sparkles, Activity, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: AuthResponse | null;
  onOpenAssistant: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: 'dispatch' | 'bookings' | 'analytics';
  setActiveTab: (tab: 'dispatch' | 'bookings' | 'analytics') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAssistant,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dispatch')}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-inner">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight text-white">DRIVA</span>
                  <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-400/30 uppercase tracking-wider">
                    Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Autonomous Freight Decision Platform</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab('dispatch')}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dispatch'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Freight Dispatch
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'bookings'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Active Bookings & Tracking
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Operations Analytics
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Status */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* System Status Indicators */}
            <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-850 px-3 py-1.5 rounded-md border border-slate-800">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Decision Engine:</span>
              <span className="text-emerald-400 font-medium">Optimal</span>
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAssistant}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sm transition-all border border-sky-400/30"
              title="Open Groq AI Transportation Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>AI Assistant</span>
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-white leading-tight">{user.full_name}</div>
                  <div className="text-[10px] text-slate-400">{user.company_name || 'Business Manager'}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
