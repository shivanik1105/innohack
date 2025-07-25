# import streamlit as st
# import pandas as pd
# from model.recommender import WageRecommender
# from utils.helpers import load_data

# def main():
#     st.title("Daily Wage Recommendation System")
    
#     # Load the dataset
#     data = load_data('data/wages.csv')
    
#     # Display the dataset
#     st.subheader("Historical Wage Data")
#     st.write(data)
    
#     # Input fields for user to enter job details
#     job_title = st.selectbox("Select Job Title", data['job_title'].unique())
#     location = st.selectbox("Select Location", data['location'].unique())
#     experience_level = st.selectbox("Select Experience Level", data['experience_level'].unique())
    
#     # Create an instance of the WageRecommender
#     recommender = WageRecommender()
#     recommender.train_model(data)
    
#     # Predict wage based on user input
#     if st.button("Get Recommended Wage"):
#         predicted_wage = recommender.predict_wage(job_title, location, experience_level)
#         st.success(f"The recommended daily wage for a {experience_level} {job_title} in {location} is: ${predicted_wage:.2f}")

# if __name__ == "__main__":
#     main()

# app.py
import streamlit as st
from utils.helpers import preprocess_data
from model.recommender import WageRecommender

def main():
    st.title("Daily Wage Recommendation System")

    # Load and clean dataset
    data = preprocess_data('data/wages.csv')

    st.subheader("Historical Wage Data")
    st.write(data)

    job_title = st.selectbox("Select Job Title", data['job_title'].unique())
    location = st.selectbox("Select Location", data['location'].unique())
    experience_level = st.selectbox("Select Experience Level", data['experience_level'].unique())

    # Instantiate and train the model
    recommender = WageRecommender(data)
    recommender.train_model()

    if st.button("Get Recommended Wage"):
        predicted_wage = recommender.predict_wage(job_title, location, experience_level)
        st.success(f"💰 Recommended daily wage for a {experience_level} {job_title} in {location}: ₹{predicted_wage:.2f}")

if __name__ == "__main__":
    main()