# class WageRecommender:
#     def __init__(self, data):
#         self.data = data
#         self.model = None

#     def train_model(self):
#         # Placeholder for model training logic
#         # This could involve using regression, decision trees, etc.
#         pass

#     def predict_wage(self, job_title, location, experience_level):
#         # Placeholder for wage prediction logic
#         # This should return a predicted wage based on the input features
#         return 0.0  # Replace with actual prediction logic

# recommender.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib # For saving the model
import os

print("Starting model training...")

# --- 1. Load Data ---
# Make sure the path to your CSV is correct relative to your backend's root directory
try:
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'wages.csv')
    data = pd.read_csv(data_path)
except FileNotFoundError:
    print(f"Error: Could not find the data file at {data_path}")
    exit()

# --- 2. Define Features and Target ---
X = data[['job_title', 'location', 'experience_level']]
y = data['wage_amount']

# --- 3. Create Preprocessing Pipeline ---
# This defines how to handle categorical data
categorical_features = ['job_title', 'location', 'experience_level']
categorical_transformer = OneHotEncoder(handle_unknown='ignore')

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', categorical_transformer, categorical_features)
    ])

# --- 4. Create and Train the Full Model Pipeline ---
# This combines the preprocessing steps with the machine learning model
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

# Train the model on the entire dataset
model_pipeline.fit(X, y)

print("Model training complete.")

# --- 5. Save the Trained Model ---
# The trained pipeline is saved to a file named 'wage_model.pkl'
model_path = os.path.join(os.path.dirname(__file__), 'wage_model.pkl')
joblib.dump(model_pipeline, model_path)

print(f"Model saved successfully to: {model_path}")