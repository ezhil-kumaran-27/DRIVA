import os
import joblib
import pandas as pd

# Load models at startup
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
MODEL_DIR = os.path.join(ROOT_DIR, 'ml', 'models')

# Known major freight route distances (km)
ROUTE_DISTANCES = {
    ("salem", "bangalore"): 205.0,
    ("bangalore", "salem"): 205.0,
    ("salem", "chennai"): 345.0,
    ("chennai", "salem"): 345.0,
    ("chennai", "bangalore"): 350.0,
    ("bangalore", "chennai"): 350.0,
    ("salem", "coimbatore"): 165.0,
    ("coimbatore", "salem"): 165.0,
}
DEFAULT_DISTANCE_KM = 220.0

class MLService:
    def __init__(self):
        try:
            self.cost_model = joblib.load(os.path.join(MODEL_DIR, 'cost_model.pkl'))
            self.eta_model = joblib.load(os.path.join(MODEL_DIR, 'eta_model.pkl'))
            self.suitability_model = joblib.load(os.path.join(MODEL_DIR, 'suitability_model.pkl'))
            self.priority_encoder = joblib.load(os.path.join(MODEL_DIR, 'priority_encoder.pkl'))
        except Exception as e:
            print(f"Warning: Could not load ML models, using fallback logic. {e}")
            self.cost_model = None
            self.eta_model = None
            self.suitability_model = None
            self.priority_encoder = None

    def get_route_distance(self, origin: str, destination: str) -> float:
        o = origin.strip().lower()
        d = destination.strip().lower()
        return ROUTE_DISTANCES.get((o, d), DEFAULT_DISTANCE_KM)

    def predict_cost(
        self,
        distance_km: float,
        cargo_weight_kg: float,
        base_rate_per_km: float,
        is_ev: bool = False,
        fuel_price_factor: float = 1.05
    ) -> float:
        if not self.cost_model:
            # Fallback
            weight_factor = 1.0 + (cargo_weight_kg / 1000.0) * 0.15
            return distance_km * base_rate_per_km * weight_factor

        # ML Features: ['distance_km', 'cargo_weight_kg', 'vehicle_efficiency', 'fuel_or_energy_cost', 'traffic_factor', 'weather_factor', 'vehicle_capacity_kg', 'delivery_priority_encoded']
        features = pd.DataFrame([{
            'distance_km': distance_km,
            'cargo_weight_kg': cargo_weight_kg,
            'vehicle_efficiency': 6.0 if is_ev else 12.0,
            'fuel_or_energy_cost': 12.0 if is_ev else 95.0,
            'traffic_factor': 1.1,
            'weather_factor': 1.0,
            'vehicle_capacity_kg': max(1000, cargo_weight_kg * 1.5),
            'delivery_priority_encoded': 0 # Normal
        }])
        cost = self.cost_model.predict(features)[0]
        return round(float(cost), 2)

    def predict_eta(
        self,
        distance_km: float,
        is_ev: bool = False,
        cargo_weight_kg: float = 1000.0
    ) -> float:
        if not self.eta_model:
            return round(distance_km / 50.0 + 1.0, 2)

        # Features: ['distance_km', 'traffic_factor', 'weather_factor', 'cargo_weight_kg', 'vehicle_capacity_kg']
        features = pd.DataFrame([{
            'distance_km': distance_km,
            'traffic_factor': 1.1,
            'weather_factor': 1.0,
            'cargo_weight_kg': cargo_weight_kg,
            'vehicle_capacity_kg': max(1000, cargo_weight_kg * 1.5)
        }])
        eta = self.eta_model.predict(features)[0]
        return round(float(eta), 2)

    def predict_suitability(
        self,
        cargo_weight_kg: float,
        provider_capacity_kg: float,
        is_ev: bool = False,
        distance_km: float = 200.0,
        cargo_type: str = "general"
    ) -> float:
        if not self.suitability_model:
            return 100.0 if cargo_weight_kg <= provider_capacity_kg else 0.0

        # Features: ['cargo_weight_kg', 'vehicle_capacity_kg', 'vehicle_age_years', 'vehicle_efficiency']
        features = pd.DataFrame([{
            'cargo_weight_kg': cargo_weight_kg,
            'vehicle_capacity_kg': provider_capacity_kg,
            'vehicle_age_years': 4,
            'vehicle_efficiency': 6.0 if is_ev else 12.0
        }])
        suit = self.suitability_model.predict(features)[0]
        # Return 0 to 100
        return 100.0 if suit == 1 else 0.0

ml_service = MLService()
