import os
import joblib
import pandas as pd

# Assume models are stored relative to the project root
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
MODEL_DIR = os.path.join(ROOT_DIR, 'ml', 'models')

# Load models lazily to avoid overhead if not used
_models = {}

def load_models():
    if not _models:
        try:
            _models['cost_model'] = joblib.load(os.path.join(MODEL_DIR, 'cost_model.pkl'))
            _models['eta_model'] = joblib.load(os.path.join(MODEL_DIR, 'eta_model.pkl'))
            _models['suitability_model'] = joblib.load(os.path.join(MODEL_DIR, 'suitability_model.pkl'))
            _models['priority_encoder'] = joblib.load(os.path.join(MODEL_DIR, 'priority_encoder.pkl'))
        except Exception as e:
            print(f"Error loading models: {e}")
            raise e

def get_transport_recommendations(request):
    """
    request: dict with keys:
    - origin, destination, distance_km, cargo_weight_kg, cargo_volume_m3
    - delivery_priority, deadline_hours
    - options: list of dicts representing providers/vehicles
    """
    load_models()
    cost_model = _models['cost_model']
    eta_model = _models['eta_model']
    suitability_model = _models['suitability_model']
    priority_encoder = _models['priority_encoder']
    
    distance_km = request.get('distance_km', 100)
    cargo_weight_kg = request.get('cargo_weight_kg', 0)
    priority = request.get('delivery_priority', 'Normal')
    
    try:
        priority_encoded = priority_encoder.transform([priority])[0]
    except:
        priority_encoded = 0 # Default fallback
        
    deadline_hours = request.get('deadline_hours', 24)
    options = request.get('options', [])
    
    results = []
    
    for opt in options:
        provider_id = opt.get('provider_id', 'Unknown')
        vehicle_id = opt.get('vehicle_id', 'Unknown')
        capacity_kg = opt.get('vehicle_capacity_kg', 0)
        availability = opt.get('vehicle_availability', 1)
        rating = opt.get('provider_rating', 0)
        
        traffic_factor = opt.get('traffic_factor', 1.0)
        weather_factor = opt.get('weather_factor', 1.0)
        driver_exp = opt.get('driver_experience_years', 1)
        
        # 1. Hard Constraints
        if availability == 0:
            continue # Reject
            
        if cargo_weight_kg > capacity_kg:
            continue # Reject
            
        # Predict Cost
        cost_features = pd.DataFrame([{
            'distance_km': distance_km,
            'cargo_weight_kg': cargo_weight_kg,
            'vehicle_efficiency': opt.get('vehicle_efficiency', 10.0),
            'fuel_or_energy_cost': opt.get('fuel_or_energy_cost', 90.0),
            'traffic_factor': traffic_factor,
            'weather_factor': weather_factor,
            'vehicle_capacity_kg': capacity_kg,
            'delivery_priority_encoded': priority_encoded
        }])
        predicted_cost = cost_model.predict(cost_features)[0]
        
        # Predict ETA
        eta_features = pd.DataFrame([{
            'distance_km': distance_km,
            'traffic_factor': traffic_factor,
            'weather_factor': weather_factor,
            'cargo_weight_kg': cargo_weight_kg,
            'vehicle_capacity_kg': capacity_kg
        }])
        predicted_eta = eta_model.predict(eta_features)[0]
        
        # Predict Suitability
        suit_features = pd.DataFrame([{
            'cargo_weight_kg': cargo_weight_kg,
            'vehicle_capacity_kg': capacity_kg,
            'vehicle_age_years': opt.get('vehicle_age_years', 5),
            'vehicle_efficiency': opt.get('vehicle_efficiency', 10.0)
        }])
        # model predicts 1 (suitable) or 0 (not suitable)
        pred_suitability = suitability_model.predict(suit_features)[0]
        
        # Deadline constraint
        if predicted_eta > deadline_hours:
            if priority == 'Urgent':
                continue # Reject if urgent
            else:
                deadline_penalty = 50 # heavily penalize
        else:
            deadline_penalty = 0
            
        # 2. Match Score Calculation
        # Normalize values to 0-100 where higher is better
        
        # Route compatibility (assume 100 for now if they serve the route)
        route_score = 100 
        
        # Cost score (lower cost -> higher score)
        # Normalize around an expected base cost, say base=500 + dist*10
        expected_cost = 500 + distance_km * 10
        cost_score = max(0, 100 - (predicted_cost / expected_cost * 50))
        cost_score = min(100, cost_score)
        
        # Delivery time score (lower ETA -> higher score)
        eta_score = max(0, 100 - (predicted_eta / deadline_hours * 80)) if deadline_hours > 0 else 0
        eta_score = min(100, eta_score) - deadline_penalty
        eta_score = max(0, eta_score)
        
        # Capacity suitability: ratio of cargo to capacity
        capacity_ratio = cargo_weight_kg / capacity_kg if capacity_kg > 0 else 0
        capacity_score = capacity_ratio * 100
        
        # Vehicle suitability: 100 if pred_suitability == 1 else 0
        v_suit_score = 100 if pred_suitability == 1 else 0
        
        # Provider reliability: rating (0-100)
        reliability_score = rating
        
        # Availability: 100 (since we already rejected 0)
        avail_score = 100
        
        # Weighted combination
        # Route compatibility: 25%
        # Cost: 20%
        # Delivery time: 20%
        # Capacity suitability: 15%
        # Vehicle suitability: 10%
        # Provider reliability: 5%
        # Availability: 5%
        
        match_score = (
            (route_score * 0.25) +
            (cost_score * 0.20) +
            (eta_score * 0.20) +
            (capacity_score * 0.15) +
            (v_suit_score * 0.10) +
            (reliability_score * 0.05) +
            (avail_score * 0.05)
        )
        
        results.append({
            'provider_id': provider_id,
            'vehicle_id': vehicle_id,
            'predicted_cost': round(predicted_cost, 2),
            'predicted_eta': round(predicted_eta, 2),
            'capacity_score': round(capacity_score, 2),
            'reliability_score': round(reliability_score, 2),
            'match_score': round(match_score, 2),
            'reasons': [
                f"Predicted cost: ₹{predicted_cost:.2f}",
                f"Predicted ETA: {predicted_eta:.2f} hours",
                "Capacity is sufficient." if cargo_weight_kg <= capacity_kg else "Capacity issue.",
                f"Provider Reliability: {rating}"
            ]
        })
        
    # Sort by match score descending
    results.sort(key=lambda x: x['match_score'], reverse=True)
    
    # Add rank
    for idx, res in enumerate(results):
        res['recommendation_rank'] = idx + 1
        
    return results

if __name__ == "__main__":
    # Test example
    req = {
        'origin': 'Salem',
        'destination': 'Bangalore',
        'distance_km': 200,
        'cargo_weight_kg': 200,
        'cargo_volume_m3': 1.5,
        'delivery_priority': 'Normal',
        'deadline_hours': 24,
        'options': [
            {
                'provider_id': 'ABC Logistics',
                'vehicle_id': 'V001',
                'vehicle_capacity_kg': 700,
                'vehicle_efficiency': 14.0,
                'fuel_or_energy_cost': 95.0,
                'traffic_factor': 1.0,
                'weather_factor': 1.0,
                'vehicle_age_years': 3,
                'provider_rating': 94,
                'vehicle_availability': 1
            },
            {
                'provider_id': 'SouthLine',
                'vehicle_id': 'V002',
                'vehicle_capacity_kg': 500,
                'vehicle_efficiency': 12.0,
                'fuel_or_energy_cost': 95.0,
                'traffic_factor': 1.2,
                'weather_factor': 1.1,
                'vehicle_age_years': 5,
                'provider_rating': 89,
                'vehicle_availability': 1
            },
            {
                'provider_id': 'GreenRoute',
                'vehicle_id': 'V003',
                'vehicle_capacity_kg': 400,
                'vehicle_efficiency': 8.0,
                'fuel_or_energy_cost': 12.0, # EV
                'traffic_factor': 1.1,
                'weather_factor': 1.0,
                'vehicle_age_years': 2,
                'provider_rating': 91,
                'vehicle_availability': 1
            },
            {
                'provider_id': 'RejectMe',
                'vehicle_id': 'V004',
                'vehicle_capacity_kg': 100, # Should be rejected due to capacity (200kg)
                'vehicle_efficiency': 10.0,
                'fuel_or_energy_cost': 95.0,
                'traffic_factor': 1.0,
                'weather_factor': 1.0,
                'vehicle_age_years': 4,
                'provider_rating': 90,
                'vehicle_availability': 1
            }
        ]
    }
    recs = get_transport_recommendations(req)
    for r in recs:
        print(r)
