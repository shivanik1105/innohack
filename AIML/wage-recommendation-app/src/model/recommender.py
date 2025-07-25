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
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

class WageRecommender:
    def __init__(self, data):
        self.data = data
        self.model = None
        self.pipeline = None

    def train_model(self):
        X = self.data[['job_title', 'location', 'experience_level']]
        y = self.data['wage_amount']

        categorical_features = ['job_title', 'location', 'experience_level']
        categorical_transformer = OneHotEncoder(handle_unknown='ignore')

        preprocessor = ColumnTransformer(
            transformers=[
                ('cat', categorical_transformer, categorical_features)
            ])

        self.pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
        ])

        self.pipeline.fit(X, y)

    def predict_wage(self, job_title, location, experience_level):
        input_df = pd.DataFrame([[job_title, location, experience_level]],
                                columns=['job_title', 'location', 'experience_level'])
        return self.pipeline.predict(input_df)[0]