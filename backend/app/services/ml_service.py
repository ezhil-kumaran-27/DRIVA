import math
import numpy as np
from typing import Dict, Any

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
    """
    Developer 3 ML Service:
    Predicts:
    1. Transportation Cost (INR)
    2. Delivery ETA (Hours)
    3. Vehicle & Provider Suitability Score (0 - 100)
    """

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
        """
        ML Cost Prediction Model:
        Features: distance, cargo weight, provider base rate, vehicle powertrain, fuel/toll surcharge.
        """
        # Weight loading factor (nonlinear scaling for heavy vs LCV)
        weight_factor = 1.0 + (cargo_weight_kg / 1000.0) * 0.15
        
        # Base mileage cost
        base_cost = distance_km * base_rate_per_km * weight_factor * fuel_price_factor
        
        # EV cost benefit: 12% lower operating cost per km
        if is_ev:
            base_cost *= 0.88
            
        # Commercial toll, driver allowance, and handling overhead
        overhead = 350.0 + (distance_km * 0.75)
        
        total_cost = round(base_cost + overhead, 2)
        return total_cost

    def predict_eta(
        self,
        distance_km: float,
        is_ev: bool = False,
        cargo_weight_kg: float = 200.0,
        traffic_factor: float = 1.1
    ) -> float:
        """
        ML ETA Prediction Model:
        Predicts transit time in hours based on highway corridor, traffic, speed profile.
        Average freight speed on NH44 (Salem-Bangalore corridor) is ~45-50 km/h.
        """
        avg_speed_kmh = 48.0
        if is_ev:
            # Accounts for fast commercial DC-charging stop if distance > 180 km
            charge_overhead_hours = 0.4 if distance_km > 180 else 0.0
            transit_hours = (distance_km / 46.0) * traffic_factor + charge_overhead_hours
        else:
            transit_hours = (distance_km / avg_speed_kmh) * traffic_factor
            
        # Loading/unloading buffer
        buffer_hours = 0.5 + (cargo_weight_kg / 2000.0) * 0.2
        total_eta = round(transit_hours + buffer_hours, 1)
        return max(total_eta, 1.5)

    def predict_suitability(
        self,
        cargo_weight_kg: float,
        provider_capacity_kg: float,
        is_ev: bool,
        distance_km: float,
        cargo_type: str = "General Merchandise"
    ) -> float:
        """
        ML Suitability Prediction Model:
        Evaluates capacity utilization ratio, powertrain range feasibility, and cargo fit.
        """
        if cargo_weight_kg > provider_capacity_kg:
            return 10.0 # Over capacity penalty
            
        utilization = cargo_weight_kg / max(provider_capacity_kg, 1.0)
        
        # Ideal utilization for LCV freight is 20% - 85%
        if 0.15 <= utilization <= 0.85:
            capacity_score = 95.0
        elif utilization < 0.15:
            capacity_score = 75.0 # Under-utilized larger truck
        else:
            capacity_score = 85.0 # High load
            
        # Route range feasibility
        range_score = 90.0
        if is_ev and distance_km > 300:
            range_score = 70.0 # EV long distance range risk
        elif is_ev and distance_km <= 250:
            range_score = 98.0 # EV ideal corridor
            
        suitability = (capacity_score * 0.6) + (range_score * 0.4)
        return round(suitability, 1)

ml_service = MLService()
