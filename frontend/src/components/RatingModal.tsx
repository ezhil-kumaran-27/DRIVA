import React, { useState } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { Star, CheckCircle2, X, MessageSquare, Award } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onReviewSubmitted: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('Excellent service. On-time delivery from Salem to Bangalore with zero damage.');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitReview({
        booking_id: booking.id,
        rating,
        feedback
      });
      setSubmitted(true);
      setTimeout(() => {
        onReviewSubmitted();
        onClose();
        setSubmitted(false);
      }, 1400);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Carrier Service Rating</h3>
              <p className="text-xs text-slate-400">Post-Delivery Vendor Evaluation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Rating Recorded in Database</h4>
            <p className="text-xs text-slate-500">
              Carrier reliability score and vendor scorecard updated in PostgreSQL.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Consignment</span>
              <span className="font-bold text-slate-900">{booking.booking_reference}</span>
              <div className="text-slate-600 mt-0.5">Driver: {booking.driver_name} ({booking.vehicle_number})</div>
            </div>

            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 text-center">
                Vendor Performance Rating
              </label>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentScore = hoverRating || rating;
                  const isFilled = star <= currentScore;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-center text-xs font-semibold text-slate-600 mt-1">
                {rating === 5 ? '5.0 — Outstanding / On-Time' : `${rating}.0 / 5.0 Stars`}
              </div>
            </div>

            {/* Feedback textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Executive Feedback & Notes
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Carrier punctuality, cargo integrity, driver conduct..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Submitting to PostgreSQL...' : 'Submit Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
