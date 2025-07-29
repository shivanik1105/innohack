def load_data(file_path):
    import pandas as pd
    data = pd.read_csv(file_path)
    return data

def clean_data(df):
    df = df.dropna()  # Remove missing values
    df = df[df['wage_amount'] > 0]  # Remove rows with non-positive wage amounts
    return df

def preprocess_data(file_path):
    df = load_data(file_path)
    df = clean_data(df)
    return df