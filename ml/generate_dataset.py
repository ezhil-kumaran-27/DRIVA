import pandas as pd
import numpy as np
import os
import random

def generate_dataset(num_records=20000, seed=42):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, '../data/driva_transportation_dataset.csv')
    np.random.seed(seed)
    random.seed(seed)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    cities = ['Salem', 'Bangalore', 'Chennai', 'Coimbatore', 'Madurai']
    
    # Predefined distances (approximate)
    distance_map = {
        ('Salem', 'Bangalore'): 200,
        ('Bangalore', 'Salem'): 200,
        ('Chennai', 'Coimbatore'): 500,
        ('Coimbatore', 'Chennai'): 500,
        ('Salem', 'Chennai'): 340,
        ('Chennai', 'Salem'): 340,
        ('Bangalore', 'Chennai'): 350,
        ('Chennai', 'Bangalore'): 350,
        ('Madurai', 'Chennai'): 460,
        ('Chennai', 'Madurai'): 460,
        ('Coimbatore', 'Bangalore'): 360,
        ('Bangalore', 'Coimbatore'): 360,
        ('Salem', 'Coimbatore'): 170,
        ('Coimbatore', 'Salem'): 170,
    }
    
    vehicles = [
        {'type': 'Tata Ace', 'capacity': 750, 'fuel_options': ['DIESEL', 'PETROL']},
        {'type': 'Bolero Pickup', 'capacity': 1500, 'fuel_options': ['DIESEL']},
        {'type': 'Mini Truck', 'capacity': 2000, 'fuel_options': ['DIESEL']},
        {'type': 'EV Cargo Van', 'capacity': 1000, 'fuel_options': ['EV']},
        {'type': 'Light Commercial Vehicle', 'capacity': 3000, 'fuel_options': ['DIESEL']},
        {'type': 'Medium Truck', 'capacity': 8000, 'fuel_options': ['DIESEL']},
        {'type': 'Heavy Truck', 'capacity': 15000, 'fuel_options': ['DIESEL']},
    ]
    
    data = []
    
    for i in range(num_records):
        origin = random.choice(cities)
        dest_choices = [c for c in cities if c != origin]
        destination = random.choice(dest_choices)
        
        # Distance calculation
        route = (origin, destination)
        if route in distance_map:
            base_dist = distance_map[route]
            distance_km = base_dist + np.random.randint(-20, 20)
        else:
            # Synthetic route distance if not in predefined map
            distance_km = np.random.randint(100, 600)
            
        cargo_weight_kg = np.random.randint(50, 15000)
        cargo_volume_m3 = cargo_weight_kg / np.random.uniform(150, 300) # realistic density
        
        vehicle = random.choice(vehicles)
        vehicle_type = vehicle['type']
        vehicle_capacity_kg = vehicle['capacity'] + np.random.randint(-50, 50)
        fuel_type = random.choice(vehicle['fuel_options'])
        
        vehicle_age_years = np.random.randint(1, 15)
        
        # Vehicle efficiency (km per liter/kWh)
        if fuel_type == 'EV':
            vehicle_efficiency = round(np.random.uniform(5.0, 8.0), 2)
            fuel_or_energy_cost = round(np.random.uniform(10.0, 15.0), 2) # cost per kWh
        else:
            vehicle_efficiency = round(np.random.uniform(3.0, 15.0) - (vehicle_age_years * 0.1), 2)
            vehicle_efficiency = max(2.0, vehicle_efficiency)
            fuel_or_energy_cost = round(np.random.uniform(85.0, 100.0), 2) # cost per liter
            
        traffic_factor = round(np.random.uniform(1.0, 2.5), 2)
        weather_factor = round(np.random.uniform(1.0, 1.5), 2)
        
        provider_rating = round(np.random.uniform(60, 100), 1)
        driver_experience_years = np.random.randint(1, 20)
        
        vehicle_availability = np.random.choice([0, 1], p=[0.05, 0.95])
        
        # Historical & Actual computations
        base_speed_kmh = 50.0
        if fuel_type == 'EV':
            base_speed_kmh = 45.0
            
        actual_speed = base_speed_kmh / (traffic_factor * weather_factor)
        actual_speed = max(10.0, actual_speed)
        
        base_time = distance_km / actual_speed
        time_noise = np.random.normal(0, base_time * 0.18) # 18% std dev for noise
        actual_delivery_time_hours = round(max(0.5, base_time + time_noise + np.random.uniform(0.5, 2.0)), 2)
        historical_delivery_time_hours = round(max(0.5, actual_delivery_time_hours + np.random.normal(0, 1.5)), 2)
        
        base_cost = 500
        distance_cost = distance_km * (fuel_or_energy_cost / vehicle_efficiency)
        weight_factor = cargo_weight_kg * 0.5
        priority_multiplier = np.random.choice([1.0, 1.2, 1.5], p=[0.6, 0.3, 0.1])
        
        base_total_cost = (base_cost + distance_cost + weight_factor) * priority_multiplier * traffic_factor
        cost_noise = np.random.normal(0, base_total_cost * 0.18) # 18% std dev for noise
        actual_delivery_cost = round(max(200.0, base_total_cost + cost_noise), 2)
        historical_cost = round(max(200.0, actual_delivery_cost + np.random.normal(0, base_total_cost * 0.1)), 2)
        
        delivery_priority = "Normal" if priority_multiplier == 1.0 else ("High" if priority_multiplier == 1.2 else "Urgent")
        
        deadline_hours = round(actual_delivery_time_hours + np.random.uniform(-5, 24), 2)
        
        # Success and Suitability labels
        if vehicle_availability == 0 or cargo_weight_kg > vehicle_capacity_kg or actual_delivery_time_hours > deadline_hours:
            delivery_success = 0
        else:
            delivery_success = np.random.choice([0, 1], p=[0.05, 0.95])
            
        vehicle_suitability = 1 if cargo_weight_kg <= vehicle_capacity_kg else 0
        provider_suitability = 1 if provider_rating >= 80 else 0
        
        row = {
            'request_id': f"REQ_{i:06d}",
            'origin': origin,
            'destination': destination,
            'distance_km': distance_km,
            'cargo_weight_kg': round(cargo_weight_kg, 2),
            'cargo_volume_m3': round(cargo_volume_m3, 2),
            'vehicle_type': vehicle_type,
            'fuel_type': fuel_type,
            'vehicle_capacity_kg': vehicle_capacity_kg,
            'vehicle_age_years': vehicle_age_years,
            'vehicle_efficiency': vehicle_efficiency,
            'fuel_or_energy_cost': fuel_or_energy_cost,
            'traffic_factor': traffic_factor,
            'weather_factor': weather_factor,
            'provider_rating': provider_rating,
            'driver_experience_years': driver_experience_years,
            'vehicle_availability': vehicle_availability,
            'historical_delivery_time_hours': historical_delivery_time_hours,
            'historical_cost': historical_cost,
            'delivery_priority': delivery_priority,
            'deadline_hours': deadline_hours,
            'actual_delivery_time_hours': actual_delivery_time_hours,
            'actual_delivery_cost': actual_delivery_cost,
            'delivery_success': delivery_success,
            'vehicle_suitability': vehicle_suitability,
            'provider_suitability': provider_suitability
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Successfully generated {num_records} records at {output_path}")

if __name__ == "__main__":
    generate_dataset()
