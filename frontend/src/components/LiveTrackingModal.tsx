import React, { useState } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import {
  X,
  CheckCircle,
  Truck,
  UserCheck,
  PackageCheck,
  Navigation,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onStatusUpdated: (updated: Booking) => void;
  onDelivered: (booking: Booking) => void;
}

const STAGES = [
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, desc: 'Booking confirmed & dispatched' },
  { key: 'DRIVER_ASSIGNED', label: 'Driver Assigned', icon: UserCheck, desc: 'Driver allocated & verified' },
  { key: 'PICKUP', label: 'Cargo Loaded', icon: PackageCheck, desc: 'Cargo weighed & loaded at Salem' },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Navigation, desc: 'Moving along NH44 corridor' },
  { key: 'DELIVERED', label: 'Delivered', icon: ShieldCheck, desc: 'Arrived at Bangalore hub' },
];

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onStatusUpdated,
  onDelivered
}) => {
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !booking) return null;

  const currentIdx = STAGES.findIndex((s) => s.key === booking.status);

  const getNextStageKey = (): string | null => {
    if (currentIdx >= 0 && currentIdx < STAGES.length - 1) {
      return STAGES[currentIdx + 1].key;
    }
    return null;
  };

  const handleAdvanceStatus = async () => {
    const nextKey = getNextStageKey();
    if (!nextKey) return;
    setUpdating(true);
    try {
      const updated = await api.updateBookingStatus(booking.id, nextKey);
      onStatusUpdated(updated);
      if (nextKey === 'DELIVERED') {
        onDelivered(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Consignment Tracking & Lifecycle</h3>
                <span className="font-mono text-xs bg-slate-800 text-sky-400 px-2 py-0.5 rounded border border-slate-700">
                  {booking.booking_reference}
                </span>
              </div>
              <p className="text-xs text-slate-400">Route: Salem Hub → Bangalore Electronic City</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEPPER PROGRESS BAR */}
          <div className="py-2">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0"></div>
              <div
                className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-sky-600 -z-0 transition-all duration-300"
                style={{
                  width: `${(Math.max(0, currentIdx) / (STAGES.length - 1)) * 100}%`
                }}
              ></div>

              {STAGES.map((s, idx) => {
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                const IconComponent = s.icon;
                return (
                  <div key={s.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-sky-600 text-white ring-4 ring-sky-100 ring-offset-2'
                          : isPassed
                          ? 'bg-sky-600 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 text-center whitespace-nowrap ${
                        isCurrent
                          ? 'text-sky-700'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DRIVER & VEHICLE TELEMETRY CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Assigned Logistics Carrier & Driver
              </span>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                  RK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{booking.driver_name}</h4>
                  <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{booking.driver_phone}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Vehicle Plate</span>
                  <span className="font-mono font-bold text-slate-800">{booking.vehicle_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Consignment Cost</span>
                  <span className="font-bold text-slate-900">₹{booking.total_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Live Checkpoint Location
              </span>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{booking.current_location}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    GPS: {booking.latitude.toFixed(4)}° N, {booking.longitude.toFixed(4)}° E
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Express NH44 Freight Corridor</span>
                <span className="font-bold text-emerald-600 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Active Link</span>
                </span>
              </div>
            </div>
          </div>

          {/* HIGHWAY VISUAL CORRIDOR */}
          <div className="bg-slate-900 rounded-xl p-5 text-white border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
              <span className="font-bold uppercase tracking-wider text-slate-400">Route Map Visualizer (NH44)</span>
              <span className="text-sky-400 font-mono text-[11px]">Distance: 205 km • Corridor Speed: 52 km/h</span>
            </div>

            <div className="py-6 flex items-center justify-between relative px-4">
              <div className="text-center">
                <div className="w-3 h-3 rounded-full bg-sky-400 mx-auto"></div>
                <span className="text-xs font-bold text-slate-200 block mt-2">Salem Origin</span>
                <span className="text-[10px] text-slate-400">NH44 Junction</span>
              </div>

              <div className="flex-1 mx-4 h-1 bg-slate-800 relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 p-1.5 rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/50"
                  style={{
                    left: `${Math.min(100, Math.max(10, (currentIdx / 4) * 100))}%`
                  }}
                >
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400 mx-auto"></div>
                <span className="text-xs font-bold text-slate-200 block mt-2">Bangalore Drop</span>
                <span className="text-[10px] text-slate-400">Electronic City</span>
              </div>
            </div>
          </div>

          {/* AUDIT LOG TIMELINE */}
          {booking.status_history && booking.status_history.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                Tracking Event Audit Trail:
              </span>
              <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-2">
                {booking.status_history.map((ev, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="w-2 h-2 rounded-full bg-sky-600 absolute -left-[21px] top-1"></span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{ev.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{ev.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Demo Lifecycle Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Current Stage: <span className="font-bold text-slate-900">{booking.status}</span>
          </div>

          <div className="flex items-center space-x-2">
            {getNextStageKey() ? (
              <button
                onClick={handleAdvanceStatus}
                disabled={updating}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center space-x-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <span>{updating ? 'Updating...' : `Advance Lifecycle → ${getNextStageKey()}`}</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
              </button>
            ) : (
              <span className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-lg">
                Consignment Delivered Successfully
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
