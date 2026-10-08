import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def train_suitability_model():
    print("Training Vehicle Suitability Model...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '../data/driva_transportation_dataset.csv')
    model_dir = os.path.join(script_dir, 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    df = pd.read_csv(data_path)
    
    features = [
        'cargo_weight_kg', 'vehicle_capacity_kg', 'vehicle_age_years',
        'vehicle_efficiency'
    ]
    
    target = 'vehicle_suitability'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=15, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds)
    rec = recall_score(y_test, preds)
    f1 = f1_score(y_test, preds)
    
    print(f"Suitability Model Evaluation - Accuracy: {acc:.2f}, Precision: {prec:.2f}, Recall: {rec:.2f}, F1: {f1:.2f}")
    
    joblib.dump(model, os.path.join(model_dir, 'suitability_model.pkl'))
    print("Suitability model saved to models/suitability_model.pkl")

if __name__ == "__main__":
    current_dir = os.path.basename(os.getcwd())
    if current_dir != 'ml':
        os.chdir('ml')
    train_suitability_model()
