import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Truck, MapPin, Navigation, Clock } from 'lucide-react';
import clsx from 'clsx';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const timelineSteps = [
  { id: 'booking_confirmed', label: 'Booking Confirmed', completed: true },
  { id: 'driver_assigned', label: 'Driver Assigned', completed: true },
  { id: 'vehicle_arrived', label: 'Vehicle Arrived', completed: true },
  { id: 'pickup_completed', label: 'Pickup Completed', completed: true },
  { id: 'in_transit', label: 'In Transit', completed: true, active: true },
  { id: 'near_destination', label: 'Near Destination', completed: false },
  { id: 'delivered', label: 'Delivered', completed: false },
];

export const DeliveryTracking = () => {
  const { id } = useParams();
  
  // Coordinates for Mumbai (pickup) to Delhi (destination) - approximate route
  const currentPosition: [number, number] = [23.2599, 77.4126]; // Bhopal (midway)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            Tracking Shipment <span className="text-brand-blue ml-2">{id || 'TR-2024'}</span>
          </h1>
          <p className="text-gray-500 mt-1">Expected Delivery: Today, 8:00 PM</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center"><Navigation className="w-4 h-4 mr-2"/> Contact Driver</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden h-[500px] z-0 relative border-2 border-gray-200">
          <MapContainer center={currentPosition} zoom={6} scrollWheelZoom={false} className="w-full h-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[19.0760, 72.8777]}>
              <Popup>Pickup: Mumbai</Popup>
            </Marker>
            <Marker position={[28.7041, 77.1025]}>
              <Popup>Destination: New Delhi</Popup>
            </Marker>
            <Marker position={currentPosition}>
              <Popup>Current Location: In Transit</Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="card p-6 flex flex-col h-[500px] overflow-y-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-brand-blue" />
            Tracking Status
          </h2>
          
          <div className="relative pl-8 space-y-8 pb-4">
            {timelineSteps.map((step, idx) => (
              <div key={step.id} className="relative">
                {/* Connecting Line */}
                {idx !== timelineSteps.length - 1 && (
                  <div className={clsx(
                    "absolute top-6 left-[-19px] w-[2px] h-full",
                    step.completed ? "bg-brand-blue" : "bg-gray-200"
                  )}></div>
                )}
                
                {/* Node */}
                <div className={clsx(
                  "absolute top-1 left-[-25px] w-3.5 h-3.5 rounded-full border-2 bg-white",
                  step.active ? "border-brand-blue bg-brand-blue ring-4 ring-blue-100" :
                  step.completed ? "border-brand-blue bg-brand-blue" :
                  "border-gray-300"
                )}></div>
                
                <div>
                  <p className={clsx(
                    "text-sm font-medium",
                    step.active ? "text-brand-blue" :
                    step.completed ? "text-gray-900" :
                    "text-gray-500"
                  )}>
                    {step.label}
                  </p>
                  {step.completed && <p className="text-xs text-gray-500 mt-1">Oct 8, 2026 - 14:30</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 flex items-start space-x-4">
          <div className="bg-gray-100 p-3 rounded-lg"><MapPin className="text-gray-600"/></div>
          <div>
            <p className="text-sm text-gray-500">Pickup</p>
            <p className="font-medium text-gray-900">Warehouse A, Mumbai</p>
          </div>
        </div>
        <div className="card p-5 flex items-start space-x-4">
          <div className="bg-gray-100 p-3 rounded-lg"><MapPin className="text-gray-600"/></div>
          <div>
            <p className="text-sm text-gray-500">Destination</p>
            <p className="font-medium text-gray-900">Sector 14, New Delhi</p>
          </div>
        </div>
        <div className="card p-5 flex items-start space-x-4">
          <div className="bg-gray-100 p-3 rounded-lg"><Truck className="text-gray-600"/></div>
          <div>
            <p className="text-sm text-gray-500">Vehicle / Driver</p>
            <p className="font-medium text-gray-900">Volvo FH16 (ABC-1234)</p>
            <p className="text-sm text-gray-500">Ramesh Singh</p>
          </div>
        </div>
      </div>
    </div>
  );
};
