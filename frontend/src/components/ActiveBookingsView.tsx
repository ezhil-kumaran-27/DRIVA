import React from 'react';
import { Booking } from '../types';
import { Package, Truck, ArrowRight, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface ActiveBookingsViewProps {
  bookings: Booking[];
  onOpenTracking: (b: Booking) => void;
  loading: boolean;
}

export const ActiveBookingsView: React.FC<ActiveBookingsViewProps> = ({
  bookings,
  onOpenTracking,
  loading
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Fetching active enterprise freight bookings from PostgreSQL...
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Active Freight Bookings</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Create a transport dispatch request above to generate ML recommendations and reserve a carrier.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">Confirmed</span>;
      case 'DRIVER_ASSIGNED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Driver Assigned</span>;
      case 'PICKUP':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Cargo Loaded</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">In Transit</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Enterprise Freight Consignments ({bookings.length})
        </h3>
        <span className="text-[11px] text-slate-500">Live PostgreSQL Records</span>
      </div>

      <div className="divide-y divide-slate-100">
        {bookings.map((b) => (
          <div key={b.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-bold text-slate-900">{b.booking_reference}</span>
                {getStatusBadge(b.status)}
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Driver: <strong className="text-slate-800">{b.driver_name}</strong> ({b.vehicle_number})</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Location: {b.current_location}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-5 self-end md:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Consignment Cost</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{b.total_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                onClick={() => onOpenTracking(b)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
              >
                <span>Live Tracking</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
