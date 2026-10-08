import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder

def train_cost_model():
    print("Training Cost Model...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '../data/driva_transportation_dataset.csv')
    model_dir = os.path.join(script_dir, 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    df = pd.read_csv(data_path)
    
    # Preprocessing
    le = LabelEncoder()
    df['delivery_priority_encoded'] = le.fit_transform(df['delivery_priority'])
    
    features = [
        'distance_km', 'cargo_weight_kg', 'vehicle_efficiency',
        'fuel_or_energy_cost', 'traffic_factor', 'weather_factor',
        'vehicle_capacity_kg', 'delivery_priority_encoded'
    ]
    target = 'actual_delivery_cost'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=15, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    
    print(f"Cost Model Evaluation - MAE: {mae:.2f}, RMSE: {rmse:.2f}, R2: {r2:.2f}")
    
    joblib.dump(model, os.path.join(model_dir, 'cost_model.pkl'))
    
    # Save the label encoder for priority
    joblib.dump(le, os.path.join(model_dir, 'priority_encoder.pkl'))
    print("Cost model saved to models/cost_model.pkl")

if __name__ == "__main__":
    # Change dir to ml/ to execute correctly if run from ml/
    # If run from DRIVA, we should adjust paths
    current_dir = os.path.basename(os.getcwd())
    if current_dir != 'ml':
        os.chdir('ml')
    train_cost_model()
