export interface User {
  id: number;
  email: string;
  full_name: string;
  company_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  full_name: string;
  company_name?: string;
  role: string;
}

export interface Provider {
  id: number;
  name: string;
  code: string;
  fleet_type: string;
  capacity_kg: number;
  base_rate_per_km: number;
  reliability_score: number;
  avg_rating: number;
  total_trips: number;
  is_ev: boolean;
  is_active: boolean;
  contact_phone?: string;
  created_at: string;
}

export interface Recommendation {
  id: number;
  request_id: number;
  provider_id: number;
  provider: Provider;
  predicted_cost: number;
  predicted_eta_hours: number;
  suitability_score: number;
  match_score: number;
  rank: number;
  ai_explanation?: string;
  created_at: string;
}

export interface MatchResultResponse {
  request_id: number;
  origin: string;
  destination: string;
  cargo_weight: number;
  deadline: string;
  top_recommendation: Recommendation;
  ranked_options: Recommendation[];
}

export interface TransportRequestCreate {
  origin: string;
  destination: string;
  cargo_weight: number;
  cargo_type?: string;
  deadline?: string;
  special_requirements?: string;
}

export interface BookingTimelineItem {
  status: string;
  timestamp: string;
  location: string;
  description: string;
}

export interface Booking {
  id: number;
  booking_reference: string;
  request_id: number;
  provider_id: number;
  recommendation_id?: number;
  user_id: number;
  total_cost: number;
  status: 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  current_location: string;
  latitude: number;
  longitude: number;
  status_history: BookingTimelineItem[];
  created_at: string;
  updated_at: string;
  provider?: Provider;
}

export interface ReviewCreate {
  booking_id: number;
  rating: number;
  feedback?: string;
}

export interface Review {
  id: number;
  booking_id: number;
  user_id: number;
  provider_id: number;
  rating: number;
  feedback?: string;
  created_at: string;
}

export interface ExplainResponse {
  explanation: string;
  model_used: string;
  is_fallback: boolean;
}

export interface AssistantChatResponse {
  answer: string;
  structured_data_used: any;
  model_used: string;
  is_fallback: boolean;
}

export interface AnalyticsDashboard {
  kpis: {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  }[];
  provider_scorecards: {
    name: string;
    reliability: number;
    total_trips: number;
    avg_rating: number;
    on_time_rate: number;
    is_ev: boolean;
  }[];
  top_routes: {
    route: string;
    trips: number;
    avg_cost: number;
    avg_eta_hours: number;
  }[];
  carbon_saved_kg: number;
  total_logistics_spend: number;
  avg_decision_engine_score: number;
}
