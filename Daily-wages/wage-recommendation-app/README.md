# Wage Recommendation System

This project is a wage recommendation system designed to suggest daily wages for blue-collar workers based on market trends. The application utilizes historical wage data to provide accurate recommendations.

## Project Structure

```
wage-recommendation-app
├── src
│   ├── app.py                # Main entry point for the Streamlit application
│   ├── data
│   │   └── wages.csv         # Custom dataset with historical wage data
│   ├── model
│   │   └── recommender.py     # Contains the WageRecommender class for wage prediction
│   └── utils
│       └── helpers.py        # Utility functions for data preprocessing
├── requirements.txt          # Project dependencies
└── README.md                 # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd wage-recommendation-app
   ```

2. **Install the required dependencies:**
   ```
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```
   streamlit run src/app.py
   ```

## Usage Guidelines

- Upon running the application, users will be presented with an interface to input job details such as job title, location, and experience level.
- The system will utilize the historical wage data to recommend a daily wage based on the provided inputs.

## Overview of the Recommendation System

The wage recommendation system is built using a machine learning model that is trained on a dataset containing various features related to blue-collar jobs. The model predicts the daily wage based on user inputs, ensuring that the recommendations are aligned with current market trends.

## Contributing

Contributions to improve the model and the application are welcome. Please feel free to submit a pull request or open an issue for discussion.