# DRIVA - API Integration Documentation

The frontend is built to communicate with a FastAPI backend. All API requests are centralized through an Axios instance in `src/api/index.ts`. 

The `VITE_API_URL` environment variable should be set to point to the backend (defaults to `http://localhost:8000/api`).

Below are the key endpoints the frontend expects to be implemented on the backend:

## 1. Authentication (`/auth`)
- **`POST /api/auth/login`**: Authenticate user and return JWT token.
- **`POST /api/auth/register`**: Register a new user/business/provider.
- **`GET /api/auth/me`**: Fetch current logged-in user details.

## 2. Transportation Requests (`/transport`)
- **`POST /api/transport/request`**: Create a new transport request (Receives payload from the 10-step wizard).
- **`GET /api/transport/requests`**: Fetch history of requests for the logged-in business.
- **`GET /api/transport/request/{id}`**: Get details of a specific request.

## 3. Smart Matching (`/matching`)
- **`GET /api/matching/{requestId}`**: Trigger the AI ML model to find the best providers. 
  - **Expected Response**: An array of `Recommendation` objects sorted by `matchScore`. The response must include reasoning for the matches.

## 4. Bookings & Deliveries (`/bookings`)
- **`POST /api/bookings`**: Confirm a booking with a recommended provider.
- **`GET /api/bookings/active`**: List all active deliveries.
- **`GET /api/bookings/{id}/tracking`**: Fetch real-time status and coordinates for a delivery.

## 5. Providers & Fleet (`/providers`)
- **`GET /api/providers/{id}`**: Fetch provider details, reviews, and reliability metrics.
- **`GET /api/providers/vehicles`**: Get list of vehicles managed by a provider.

## 6. Analytics (`/analytics`)
- **`GET /api/analytics/business`**: Fetch metrics like total spend, monthly chart data, and delivery performance for the dashboard.
- **`GET /api/analytics/admin`**: Fetch platform-wide GMV, total active bookings, and system health metrics.

---
**Note for Backend Devs:**
Please review `src/types/index.ts` to see the exact TypeScript interfaces expected in the JSON responses.
