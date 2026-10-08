# DRIVA ML Pipeline & Decision Engine

This document outlines the machine learning models, synthetic dataset generation, and decision engine implemented for the DRIVA smart match functionality.

## IMPORTANT DISCLAIMER
**The current dataset is synthetic and is intended for hackathon demonstration and pipeline validation. Production deployment requires historical transportation data.**

## 1. Synthetic Dataset Generation
Because historical real-world transportation data is unavailable for this hackathon, we implemented a data generator that creates realistic, mathematically bounded transportation records.
- **Generator Script:** `ml/generate_dataset.py`
- **Output Size:** 20,000 records
- **Random Seed:** 42 (for reproducibility)
- **Dataset Location:** `data/driva_transportation_dataset.csv`

### Features and Logic
Instead of pure noise, the dataset uses formulaic dependencies:
- `actual_delivery_cost` = Base Cost + Distance Cost + Weight Factor, scaled by Traffic and Delivery Priority.
- `actual_delivery_time_hours` = Distance / Speed, adjusted by Traffic and Weather factors.
- `vehicle_suitability` is computed by strictly verifying if cargo weight exceeds vehicle capacity.

## 2. Machine Learning Models
Three models were trained on the synthetic dataset to power the DRIVA prediction logic. Models are stored using `joblib` in the `ml/models/` directory.

### Model 1: Delivery Cost Prediction
- **Algorithm:** RandomForestRegressor
- **Features:** `distance_km`, `cargo_weight_kg`, `vehicle_efficiency`, `fuel_or_energy_cost`, `traffic_factor`, `weather_factor`, `vehicle_capacity_kg`, `delivery_priority`
- **Target:** `actual_delivery_cost`

### Model 2: ETA Prediction
- **Algorithm:** RandomForestRegressor
- **Features:** `distance_km`, `traffic_factor`, `weather_factor`, `cargo_weight_kg`, `vehicle_capacity_kg`
- **Target:** `actual_delivery_time_hours`

### Model 3: Vehicle Suitability
- **Algorithm:** RandomForestClassifier
- **Features:** `cargo_weight_kg`, `vehicle_capacity_kg`, `vehicle_age_years`, `vehicle_efficiency`
- **Target:** `vehicle_suitability`

## 3. DRIVA Decision Engine
The decision engine calculates the best matches between transportation options based on deterministic constraints and predictive ML scores.
- **Engine Script:** `backend/app/decision_engine/engine.py`

### Hard Constraints
The decision engine automatically rejects options if:
- The capacity is insufficient (`cargo_weight > vehicle_capacity`).
- The provider is unavailable.
- For non-urgent deliveries, late deliveries are heavily penalized. Urgent deliveries missing the deadline are rejected.

### Scoring Logic
After predictions and constraints, values are normalized (0-100) and weighted:
- Route compatibility: 25%
- Cost: 20%
- Delivery time: 20%
- Capacity suitability: 15%
- Vehicle suitability: 10%
- Provider reliability: 5%
- Availability: 5%

## 4. Notes for Developer 4
Here is the required information to integrate this ML pipeline into the rest of the application:

1. **Dataset Location:** `data/driva_transportation_dataset.csv`
2. **Model Locations:** `ml/models/cost_model.pkl`, `ml/models/eta_model.pkl`, `ml/models/suitability_model.pkl`, `ml/models/priority_encoder.pkl`
3. **Python Dependencies:** `pandas`, `numpy`, `scikit-learn`, `joblib` (listed in `requirements.txt`)
4. **Training Command:**
   ```bash
   pip install -r requirements.txt
   python ml/generate_dataset.py
   python ml/train_cost_model.py
   python ml/train_eta_model.py
   python ml/train_suitability_model.py
   ```
5. **Inference Function & Decision Engine Function:**
   Call `get_transport_recommendations(request)` from `backend/app/decision_engine/engine.py`.
   
6. **Expected Input Schema:**
   ```python
   {
       "origin": "Salem",
       "destination": "Bangalore",
       "distance_km": 200,
       "cargo_weight_kg": 200,
       "cargo_volume_m3": 1.5,
       "delivery_priority": "Normal",
       "deadline_hours": 24,
       "options": [
           {
               "provider_id": "ABC Logistics",
               "vehicle_id": "V001",
               "vehicle_capacity_kg": 700,
               "vehicle_efficiency": 14.0,
               "fuel_or_energy_cost": 95.0,
               "provider_rating": 94,
               "vehicle_age_years": 3,
               "driver_experience_years": 5,
               "vehicle_availability": 1,
               "traffic_factor": 1.2,
               "weather_factor": 1.0
           }
       ]
   }
   ```
7. **Expected Output Schema:**
   ```python
   [
       {
           "provider_id": "ABC Logistics",
           "vehicle_id": "V001",
           "predicted_cost": 4800.50,
           "predicted_eta": 7.5,
           "capacity_score": 28.57,
           "reliability_score": 94,
           "match_score": 85.3,
           "recommendation_rank": 1,
           "reasons": [
               "Predicted cost: ₹4800.50",
               "Predicted ETA: 7.50 hours",
               "Capacity is sufficient.",
               "Provider Reliability: 94"
           ]
       }
   ]
   ```

## Limitations & Future Enhancements
- The current implementation predicts `actual_delivery_cost` and `actual_delivery_time_hours` directly using RandomForest without geographic coordinates.
- Geographic constraints and routing delays are simulated via `traffic_factor` and `weather_factor`.
- In a production environment with real data, time-series analysis and geospatial models (e.g. relying on Google Maps API for real-time routing) should be integrated.
