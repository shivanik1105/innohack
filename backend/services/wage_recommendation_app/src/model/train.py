# This script is for training the wage recommendation model ONCE.
# Run it from your terminal: python services/wage_recommendation_app/src/model/train.py

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib # For saving the model
import os

print("Starting wage recommender model training...")

# --- 1. Load Data ---
# This path assumes your data is in 'src/data/wages.csv' relative to this script
try:
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'wages.csv')
    data = pd.read_csv(data_path)
except FileNotFoundError:
    print(f"Error: Could not find the data file at {data_path}")
    exit()

# --- 2. Define Features and Target ---
X = data[['job_title', 'location', 'experience_level']]
y = data['wage_amount']

# --- 3. Create Preprocessing & Model Pipeline ---
categorical_features = ['job_title', 'location', 'experience_level']
categorical_transformer = OneHotEncoder(handle_unknown='ignore')

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', categorical_transformer, categorical_features)
    ])

model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

# --- 4. Train the Model ---
model_pipeline.fit(X, y)

print("Model training complete.")

# --- 5. Save the Trained Model ---
# The trained pipeline is saved to a file named 'wage_model.pkl' in the same directory
model_path = os.path.join(os.path.dirname(__file__), 'wage_model.pkl')
joblib.dump(model_pipeline, model_path)

print(f"Model saved successfully to: {model_path}")
