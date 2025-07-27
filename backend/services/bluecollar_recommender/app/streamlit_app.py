import streamlit as st
from recommender.data_loader import load_data
from recommender.utils import compute_similarity
from recommender.recommender import recommend
import pandas as pd

st.title("🔧 Blue Collar Job Recommender")

workers, companies = load_data()
worker_vecs, company_vecs = compute_similarity(workers, companies)

worker_name = st.selectbox("Select Worker", workers['name'])

if worker_name:
    idx = workers[workers['name'] == worker_name].index[0]
    matched, scores = recommend(idx, worker_vecs, company_vecs, companies)

    st.subheader("Recommended Companies")
    for i, row in matched.iterrows():
        st.markdown(f"- ✅ **{row['name']}** — Match Score: {round(scores[i], 2)}")

    st.subheader("Latest Job Postings")
    latest = companies.sort_values(by='posted', ascending=False).head(3)
    for _, row in latest.iterrows():
        st.markdown(f"- 🆕 **{row['name']}** — Posted: {row['posted']}")
