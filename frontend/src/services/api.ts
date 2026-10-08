import {
  AuthResponse,
  MatchResultResponse,
  TransportRequestCreate,
  Booking,
  Review,
  ReviewCreate,
  ExplainResponse,
  AssistantChatResponse,
  AnalyticsDashboard,
  Provider
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('driva_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // 1. Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Authentication failed');
    }
    const data: AuthResponse = await res.json();
    localStorage.setItem('driva_token', data.access_token);
    localStorage.setItem('driva_user', JSON.stringify(data));
    return data;
  },

  logout() {
    localStorage.removeItem('driva_token');
    localStorage.removeItem('driva_user');
  },

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('driva_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // 2. Transport Requests & Matching Pipeline
  async createTransportRequest(payload: TransportRequestCreate): Promise<MatchResultResponse> {
    const res = await fetch(`${API_BASE}/transport-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to process transport request');
    }
    return res.json();
  },

  // 3. AI Explanation Layer (Groq)
  async explainRecommendation(recommendationId: number): Promise<ExplainResponse> {
    const res = await fetch(`${API_BASE}/recommendations/${recommendationId}/explain`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate AI explanation');
    }
    return res.json();
  },

  // 4. Transportation Assistant (Grounded Groq + Database Data)
  async askAssistant(query: string, requestId?: number): Promise<AssistantChatResponse> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, request_id: requestId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Assistant query failed');
    }
    return res.json();
  },

  // 5. Booking Service
  async createBooking(requestId: number, recommendationId: number): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ request_id: requestId, recommendation_id: recommendationId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create booking');
    }
    return res.json();
  },

  async listBookings(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async updateBookingStatus(bookingId: number, status: string, notes?: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update booking status');
    }
    return res.json();
  },

  // 6. Carrier Review & Rating
  async submitReview(review: ReviewCreate): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit review');
    }
    return res.json();
  },

  // 7. Analytics Dashboard
  async getAnalytics(): Promise<AnalyticsDashboard> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch analytics');
    }
    return res.json();
  },

  // 8. Fleet Providers
  async getProviders(): Promise<Provider[]> {
    const res = await fetch(`${API_BASE}/providers`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  }
};
