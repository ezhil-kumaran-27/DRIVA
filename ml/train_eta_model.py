import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def train_eta_model():
    print("Training ETA Model...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '../data/driva_transportation_dataset.csv')
    model_dir = os.path.join(script_dir, 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    df = pd.read_csv(data_path)
    
    features = [
        'distance_km', 'traffic_factor', 'weather_factor',
        'cargo_weight_kg', 'vehicle_capacity_kg'
    ]
    
    # We predict actual_delivery_time_hours
    target = 'actual_delivery_time_hours'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=15, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    
    print(f"ETA Model Evaluation - MAE: {mae:.2f}, RMSE: {rmse:.2f}, R2: {r2:.2f}")
    
    joblib.dump(model, os.path.join(model_dir, 'eta_model.pkl'))
    print("ETA model saved to models/eta_model.pkl")

if __name__ == "__main__":
    current_dir = os.path.basename(os.getcwd())
    if current_dir != 'ml':
        os.chdir('ml')
    train_eta_model()
