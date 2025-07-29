"""
AI/ML Recommendation Service
Integrates with the bluecollar_recommender AIML system
"""
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import Job, User
import os
from django.conf import settings

class JobRecommendationService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        
    def get_job_recommendations(self, worker, limit=10):
        """
        Get AI-powered job recommendations for a worker
        """
        try:
            # Get all open jobs
            all_jobs = Job.objects.filter(status='open')
            
            if not all_jobs.exists():
                return []
            
            # Convert jobs to DataFrame for ML processing
            jobs_df = self._jobs_to_dataframe(all_jobs)
            
            # Get worker profile for matching
            worker_profile = self._get_worker_profile(worker)
            
            # Calculate recommendations based on worker type
            if worker.userType == 'skilled':
                recommendations = self._get_skilled_recommendations(worker_profile, jobs_df)
            else:
                recommendations = self._get_daily_recommendations(worker_profile, jobs_df)
            
            # Convert back to Job objects
            recommended_jobs = []
            for job_id in recommendations[:limit]:
                try:
                    job = Job.objects.get(id=job_id)
                    recommended_jobs.append(job)
                except Job.DoesNotExist:
                    continue
                    
            return recommended_jobs
            
        except Exception as e:
            print(f"Recommendation error: {e}")
            # Fallback to simple location-based recommendations
            return self._get_fallback_recommendations(worker, limit)
    
    def _jobs_to_dataframe(self, jobs):
        """Convert Django Job queryset to pandas DataFrame"""
        data = []
        for job in jobs:
            data.append({
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'location': job.location,
                'pincode': job.pincode,
                'payPerDay': float(job.payPerDay),
                'text_content': f"{job.title} {job.description} {job.location}"
            })
        return pd.DataFrame(data)
    
    def _get_worker_profile(self, worker):
        """Extract worker profile for matching"""
        job_types = worker.JobTypes if worker.JobTypes else []
        job_types_str = ' '.join(job_types) if job_types else ''
        
        return {
            'id': worker.uid,
            'name': worker.name,
            'userType': worker.userType,
            'jobTypes': job_types,
            'pincode': worker.pinCode,
            'text_content': f"{worker.name} {job_types_str} {worker.userType}"
        }
    
    def _get_skilled_recommendations(self, worker_profile, jobs_df):
        """Get recommendations for skilled workers using ML"""
        try:
            # Create text corpus for similarity calculation
            job_texts = jobs_df['text_content'].tolist()
            worker_text = worker_profile['text_content']
            
            # Add worker profile to corpus
            all_texts = [worker_text] + job_texts
            
            # Calculate TF-IDF vectors
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            
            # Calculate cosine similarity between worker and jobs
            worker_vector = tfidf_matrix[0:1]  # First row is worker
            job_vectors = tfidf_matrix[1:]     # Rest are jobs
            
            similarities = cosine_similarity(worker_vector, job_vectors).flatten()
            
            # Get job indices sorted by similarity
            job_indices = np.argsort(similarities)[::-1]
            
            # Apply additional filters
            filtered_recommendations = []
            for idx in job_indices:
                job_row = jobs_df.iloc[idx]
                score = similarities[idx]
                
                # Boost score for matching job types
                if worker_profile['jobTypes']:
                    for job_type in worker_profile['jobTypes']:
                        if job_type.lower() in job_row['text_content'].lower():
                            score += 0.3
                
                # Boost score for nearby locations (same pincode prefix)
                if (worker_profile['pincode'] and job_row['pincode'] and 
                    job_row['pincode'].startswith(worker_profile['pincode'][:3])):
                    score += 0.2
                
                filtered_recommendations.append((job_row['id'], score))
            
            # Sort by final score and return job IDs
            filtered_recommendations.sort(key=lambda x: x[1], reverse=True)
            return [job_id for job_id, score in filtered_recommendations]
            
        except Exception as e:
            print(f"Skilled recommendation error: {e}")
            return self._get_simple_recommendations(worker_profile, jobs_df)
    
    def _get_daily_recommendations(self, worker_profile, jobs_df):
        """Get recommendations for daily workers"""
        try:
            # For daily workers, prioritize location and basic job matching
            recommendations = []
            
            for _, job_row in jobs_df.iterrows():
                score = 0.0
                
                # Location matching (highest priority for daily workers)
                if (worker_profile['pincode'] and job_row['pincode'] and 
                    job_row['pincode'].startswith(worker_profile['pincode'][:3])):
                    score += 0.5
                
                # Job type matching
                if worker_profile['jobTypes']:
                    for job_type in worker_profile['jobTypes']:
                        if job_type.lower() in job_row['text_content'].lower():
                            score += 0.3
                
                # Pay rate consideration (higher pay = higher score)
                normalized_pay = min(job_row['payPerDay'] / 2000.0, 1.0)  # Normalize to 0-1
                score += normalized_pay * 0.2
                
                recommendations.append((job_row['id'], score))
            
            # Sort by score and return job IDs
            recommendations.sort(key=lambda x: x[1], reverse=True)
            return [job_id for job_id, score in recommendations]
            
        except Exception as e:
            print(f"Daily recommendation error: {e}")
            return self._get_simple_recommendations(worker_profile, jobs_df)
    
    def _get_simple_recommendations(self, worker_profile, jobs_df):
        """Simple fallback recommendations"""
        # Just return jobs sorted by pay rate and location proximity
        recommendations = []
        
        for _, job_row in jobs_df.iterrows():
            score = job_row['payPerDay'] / 1000.0  # Simple pay-based scoring
            
            # Boost local jobs
            if (worker_profile['pincode'] and job_row['pincode'] and 
                job_row['pincode'].startswith(worker_profile['pincode'][:3])):
                score += 500
                
            recommendations.append((job_row['id'], score))
        
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return [job_id for job_id, score in recommendations]
    
    def _get_fallback_recommendations(self, worker, limit):
        """Ultimate fallback - just return recent jobs"""
        try:
            jobs = Job.objects.filter(status='open').order_by('-createdAt')[:limit]
            return list(jobs)
        except:
            return []

# Global instance
recommendation_service = JobRecommendationService()
