from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def compute_similarity(workers, companies):
    all_text = workers['skills'].tolist() + companies['required_skills'].tolist()
    vectorizer = TfidfVectorizer()
    tfidf = vectorizer.fit_transform(all_text)
    return tfidf[:len(workers)], tfidf[len(workers):]
