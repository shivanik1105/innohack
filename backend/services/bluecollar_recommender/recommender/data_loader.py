import pandas as pd

def load_data():
    workers = pd.read_csv("data/workers.csv")
    companies = pd.read_csv("data/companies.csv")
    return workers, companies
