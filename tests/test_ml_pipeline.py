import os
import sys
import unittest

# Ensure the backend directory is in the path for importing
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
sys.path.insert(0, ROOT_DIR)

from backend.app.decision_engine.engine import get_transport_recommendations, load_models

class TestMLPipeline(unittest.TestCase):
    def setUp(self):
        # We ensure models are generated before testing
        # In a real environment, we'd mock this or use test models.
        # Here we just verify that they load and predict correctly.
        load_models()

    def test_model_loading(self):
        # Implicitly tested in setUp, but let's assert
        from backend.app.decision_engine.engine import _models
        self.assertIn('cost_model', _models)
        self.assertIn('eta_model', _models)
        self.assertIn('suitability_model', _models)

    def test_match_score_and_predictions(self):
        # Salem to Bangalore, 200kg
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
                }
            ]
        }
        recs = get_transport_recommendations(req)
        self.assertEqual(len(recs), 1)
        rec = recs[0]
        
        self.assertEqual(rec['provider_id'], 'ABC Logistics')
        self.assertGreater(rec['predicted_cost'], 0)
        self.assertGreater(rec['predicted_eta'], 0)
        self.assertGreater(rec['match_score'], 0)
        
    def test_capacity_rejection(self):
        req = {
            'origin': 'Salem',
            'destination': 'Bangalore',
            'distance_km': 200,
            'cargo_weight_kg': 1000,
            'delivery_priority': 'Normal',
            'deadline_hours': 24,
            'options': [
                {
                    'provider_id': 'RejectMe Logistics',
                    'vehicle_id': 'V002',
                    'vehicle_capacity_kg': 700, # Not enough capacity
                    'vehicle_availability': 1
                }
            ]
        }
        recs = get_transport_recommendations(req)
        # Should be empty because capacity is insufficient
        self.assertEqual(len(recs), 0)

    def test_deadline_handling(self):
        req = {
            'origin': 'Salem',
            'destination': 'Bangalore',
            'distance_km': 1000, # Very far
            'cargo_weight_kg': 200,
            'delivery_priority': 'Urgent',
            'deadline_hours': 1, # Impossible deadline
            'options': [
                {
                    'provider_id': 'Fast Logistics',
                    'vehicle_id': 'V003',
                    'vehicle_capacity_kg': 700,
                    'vehicle_availability': 1,
                    'traffic_factor': 2.0
                }
            ]
        }
        recs = get_transport_recommendations(req)
        # Should reject because it's urgent and deadline missed
        self.assertEqual(len(recs), 0)

if __name__ == '__main__':
    unittest.main()
