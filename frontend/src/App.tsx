import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import {
  AuthResponse,
  MatchResultResponse,
  Recommendation,
  Booking,
  ExplainResponse
} from './types';
import { Navbar } from './components/Navbar';
import { BusinessLogin } from './components/BusinessLogin';
import { CreateRequestForm } from './components/CreateRequestForm';
import { RecommendationsView } from './components/RecommendationsView';
import { AIExplanationModal } from './components/AIExplanationModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { RatingModal } from './components/RatingModal';
import { ActiveBookingsView } from './components/ActiveBookingsView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboard';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'bookings' | 'analytics'>('dispatch');
  
  // Modals & Drawers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // Data states
  const [matchData, setMatchData] = useState<MatchResultResponse | null>(null);
  const [selectedRecForExplain, setSelectedRecForExplain] = useState<Recommendation | null>(null);
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBookingForTracking, setSelectedBookingForTracking] = useState<Booking | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const [formLoading, setFormLoading] = useState(false);

  // Initialize user from localStorage or auto-login with default demo credentials
  useEffect(() => {
    const existing = api.getCurrentUser();
    if (existing) {
      setUser(existing);
    } else {
      // Auto-authenticate default demo business account for effortless evaluation
      api.login('business@driva.com', 'driva123')
        .then(setUser)
        .catch(() => {});
    }
  }, []);

  // Fetch bookings when entering bookings tab
  const refreshBookings = async () => {
    setBookingsLoading(true);
    try {
      const data = await api.listBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings' || user) {
      refreshBookings();
    }
  }, [activeTab, user]);

  // Step 2 & 3: Transport Request Created & ML Matching Result
  const handleRequestMatched = (result: MatchResultResponse) => {
    setMatchData(result);
    // Smooth scroll down to recommendations
    setTimeout(() => {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }, 100);
  };

  // Step 4: "Why DRIVA recommended this" -> Groq Explanation
  const handleExplain = async (rec: Recommendation) => {
    setSelectedRecForExplain(rec);
    setIsExplainOpen(true);
    setExplainLoading(true);
    try {
      const res = await api.explainRecommendation(rec.id);
      setExplainData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setExplainLoading(false);
    }
  };

  // Step 5: "BOOK NOW" -> Saves Booking in PostgreSQL
  const handleBookNow = async (rec: Recommendation) => {
    if (!matchData) return;
    setBookingInProgress(true);
    try {
      const booking = await api.createBooking(matchData.request_id, rec.id);
      setSelectedBookingForTracking(booking);
      setIsTrackingOpen(true);
      refreshBookings();
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    } finally {
      setBookingInProgress(false);
    }
  };

  // Step 6: Tracking Status Updated
  const handleStatusUpdated = (updated: Booking) => {
    setSelectedBookingForTracking(updated);
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  // Step 7: Booking Delivered -> Trigger Rating Modal
  const handleDelivered = (b: Booking) => {
    setIsTrackingOpen(false);
    setSelectedBookingForTracking(b);
    setTimeout(() => {
      setIsRatingOpen(true);
    }, 300);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* 1. Header Navigation */}
      <Navbar
        user={user}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* DISPATCH TAB */}
        {activeTab === 'dispatch' && (
          <div className="space-y-8">
            {/* Enterprise Hero Banner */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 mb-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                    <span>DRIVA Intelligent Dispatch Hub</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Multi-Attribute Carrier Selection & ML Decision Platform
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Evaluates freight corridors, payload dynamics, carrier reliability and cost curves to recommend optimal logistics partners with natural-language AI justification.
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-start md:self-auto">
                  <button
                    onClick={() => setIsAssistantOpen(true)}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center space-x-2 shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ask Transportation Assistant</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 1: Create Transport Request Form */}
            <CreateRequestForm
              onSuccess={handleRequestMatched}
              loading={formLoading}
              setLoading={setFormLoading}
            />

            {/* Step 2 & 3: Recommendations & AI Explanation View */}
            {matchData && (
              <div className="animate-in fade-in duration-300">
                <RecommendationsView
                  matchData={matchData}
                  onExplainClick={handleExplain}
                  onBookNowClick={handleBookNow}
                  bookingLoading={bookingInProgress}
                />
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS & TRACKING TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <ActiveBookingsView
              bookings={bookings}
              onOpenTracking={(b) => {
                setSelectedBookingForTracking(b);
                setIsTrackingOpen(true);
              }}
              loading={bookingsLoading}
            />
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && <AnalyticsDashboardView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">DRIVA</span>
            <span>• Enterprise Freight Optimization System</span>
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>FastAPI REST Backend</span>
            <span>PostgreSQL Database</span>
            <span>Decision Engine ML</span>
            <span>Groq LLaMA 3.3 AI</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <BusinessLogin
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      <AIExplanationModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        recommendation={selectedRecForExplain}
        explainData={explainData}
        loading={explainLoading}
      />

      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activeRequestId={matchData?.request_id}
      />

      <LiveTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        booking={selectedBookingForTracking}
        onStatusUpdated={handleStatusUpdated}
        onDelivered={handleDelivered}
      />

      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        booking={selectedBookingForTracking}
        onReviewSubmitted={refreshBookings}
      />
    </div>
  );
}

export default App;
