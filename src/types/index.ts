export type Role = 'business' | 'provider' | 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyName?: string;
  avatarUrl?: string;
}

export interface TransportRequest {
  id: string;
  pickupLocation: string;
  destination: string;
  cargoType: string;
  cargoWeight: number; // in kg
  cargoDimensions: string;
  vehicleRequirement: string;
  deadline: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'matched' | 'booked' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Vehicle {
  id: string;
  providerId: string;
  make: string;
  model: string;
  licensePlate: string;
  capacity: number; // in kg
  type: string;
  status: 'available' | 'in_transit' | 'maintenance';
}

export interface Provider {
  id: string;
  name: string;
  rating: number;
  reliability: number;
  totalDeliveries: number;
  activeVehicles: number;
}

export interface Recommendation {
  id: string;
  requestId: string;
  provider: Provider;
  vehicle: Vehicle;
  matchScore: number;
  cost: number;
  etaHours: number;
  capacity: number;
  reasoning: string;
}

export interface Booking {
  id: string;
  requestId: string;
  providerId: string;
  vehicleId: string;
  driverId?: string;
  cost: number;
  status: DeliveryStatus;
  createdAt: string;
}

export type DeliveryStatus = 'booking_confirmed' | 'driver_assigned' | 'vehicle_arrived' | 'pickup_completed' | 'in_transit' | 'near_destination' | 'delivered';

export interface Analytics {
  totalSpend: number;
  activeDeliveries: number;
  completedDeliveries: number;
  averageSavings: number;
  monthlySpend: { month: string; amount: number }[];
  deliveryPerformance: { status: string; count: number }[];
}
