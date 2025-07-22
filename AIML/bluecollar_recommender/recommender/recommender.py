from sklearn.metrics.pairwise import cosine_similarity

def recommend(worker_index, worker_vecs, company_vecs, companies, top_n=3):
    similarities = cosine_similarity(worker_vecs[worker_index], company_vecs).flatten()
    top_matches = similarities.argsort()[::-1][:top_n]
    return companies.iloc[top_matches], similarities[top_matches]
