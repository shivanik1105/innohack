import pandas as pd
import joblib
import os

class WageRecommender:
    def __init__(self):
        """
        Initializes the recommender by loading the pre-trained model pipeline.
        """
        # Define the path to the saved model file
        model_path = os.path.join(os.path.dirname(__file__), 'wage_model.pkl')
        
        try:
            # Load the trained pipeline from the file
            self.pipeline = joblib.load(model_path)
            print("Wage recommendation model loaded successfully.")
        except FileNotFoundError:
            print(f"Error: Model file not found at {model_path}")
            print("Please run the train.py script first to create the model file.")
            self.pipeline = None

    def predict_wage(self, job_title: str, location: str, experience_level: str) -> float:
        """
        Predicts the daily wage for a given set of job features.
        """
        if self.pipeline is None:
            # Return a default or raise an error if the model isn't loaded
            raise RuntimeError("WageRecommender is not initialized. Model file may be missing.")

        # Create a DataFrame from the input, matching the training format
        input_df = pd.DataFrame([[job_title, location, experience_level]],
                                  columns=['job_title', 'location', 'experience_level'])
        
        # Use the loaded pipeline to make a prediction
        prediction = self.pipeline.predict(input_df)
        
        # Return the first (and only) prediction result, rounded for clarity
        return round(prediction[0], 2)

