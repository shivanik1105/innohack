import math
import re
from typing import List, Dict, Tuple
from collections import Counter
from django.db.models import Q
from worker.models import User, Job
import logging

logger = logging.getLogger(__name__)

class JobRecommendationEngine:
    """Advanced job recommendation engine with TF-IDF scoring and location-based matching"""
    
    def __init__(self):
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
        }
    
    def get_recommendations(self, user_id: str, max_distance_km: float = 50.0, limit: int = 10) -> List[Dict]:
        """
        Get personalized job recommendations for a user
        
        Args:
            user_id: User ID to get recommendations for
            max_distance_km: Maximum distance for location-based filtering
            limit: Maximum number of recommendations to return
            
        Returns:
            List of recommended jobs with scores
        """
        try:
            user = User.objects.get(uid=user_id)
            
            # Get user's skills and preferences
            user_skills = user.skills or []
            user_job_types = user.JobTypes or []
            user_location = (user.latitude, user.longitude) if user.latitude and user.longitude else None
            
            # Get available jobs
            available_jobs = Job.objects.filter(
                status__in=['open', 'active']
            ).exclude(
                # Exclude jobs user has already applied to or completed
                id__in=user.work_history.values_list('job_id', flat=True)
            )
            
            # Filter by location if user location is available
            if user_location:
                available_jobs = self._filter_by_location(
                    available_jobs, user_location, max_distance_km
                )
            
            # Calculate recommendation scores
            job_scores = []
            for job in available_jobs:
                score = self._calculate_job_score(user, job)
                if score > 0:  # Only include jobs with positive scores
                    job_scores.append({
                        'job': job,
                        'score': score,
                        'match_reasons': self._get_match_reasons(user, job)
                    })
            
            # Sort by score and return top recommendations
            job_scores.sort(key=lambda x: x['score'], reverse=True)
            
            # Format recommendations
            recommendations = []
            for item in job_scores[:limit]:
                job = item['job']
                recommendations.append({
                    'id': job.id,
                    'title': job.title,
                    'description': job.description,
                    'location': job.location,
                    'wage': job.wage,
                    'jobType': job.jobType,
                    'requirements': job.requirements,
                    'postedAt': job.postedAt.isoformat() if job.postedAt else None,
                    'score': round(item['score'], 2),
                    'match_reasons': item['match_reasons'],
                    'distance_km': self._calculate_distance(user_location, (job.latitude, job.longitude)) if user_location and job.latitude else None
                })
            
            return recommendations
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return []
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return []
    
    def _calculate_job_score(self, user: User, job: Job) -> float:
        """Calculate recommendation score for a job based on user profile"""
        score = 0.0
        
        # 1. Skill matching (40% weight)
        skill_score = self._calculate_skill_score(user.skills or [], job)
        score += skill_score * 0.4
        
        # 2. Job type matching (25% weight)
        job_type_score = self._calculate_job_type_score(user.JobTypes or [], job.jobType)
        score += job_type_score * 0.25
        
        # 3. Experience level matching (15% weight)
        experience_score = self._calculate_experience_score(user.experienceYears, job)
        score += experience_score * 0.15
        
        # 4. Verification bonus (10% weight)
        verification_score = self._calculate_verification_score(user)
        score += verification_score * 0.1
        
        # 5. Rating bonus (10% weight)
        rating_score = self._calculate_rating_score(user.averageRating)
        score += rating_score * 0.1
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _calculate_skill_score(self, user_skills: List[str], job: Job) -> float:
        """Calculate skill matching score using TF-IDF"""
        if not user_skills:
            return 0.0
        
        # Extract skills from job description and requirements
        job_text = f"{job.title} {job.description} {job.requirements or ''}"
        job_skills = self._extract_skills_from_text(job_text)
        
        if not job_skills:
            return 0.0
        
        # Calculate TF-IDF similarity
        user_skills_lower = [skill.lower() for skill in user_skills]
        job_skills_lower = [skill.lower() for skill in job_skills]
        
        # Simple overlap score
        common_skills = set(user_skills_lower) & set(job_skills_lower)
        if not common_skills:
            return 0.0
        
        # TF-IDF inspired scoring
        tf_score = len(common_skills) / len(user_skills_lower)
        idf_score = len(common_skills) / len(job_skills_lower)
        
        return (tf_score + idf_score) / 2
    
    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skill keywords from job text"""
        # Common blue-collar skills
        skill_keywords = [
            'plumber', 'plumbing', 'electrician', 'electrical', 'painter', 'painting',
            'carpenter', 'carpentry', 'welder', 'welding', 'mason', 'masonry',
            'construction', 'building', 'repair', 'maintenance', 'installation',
            'hvac', 'roofing', 'flooring', 'tiling', 'drywall', 'concrete',
            'landscaping', 'gardening', 'cleaning', 'housekeeping', 'cooking',
            'driving', 'delivery', 'security', 'guard', 'helper', 'assistant'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in skill_keywords:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def _calculate_job_type_score(self, user_job_types: List[str], job_type: str) -> float:
        """Calculate job type matching score"""
        if not user_job_types or not job_type:
            return 0.0
        
        user_types_lower = [jt.lower() for jt in user_job_types]
        job_type_lower = job_type.lower()
        
        # Exact match
        if job_type_lower in user_types_lower:
            return 1.0
        
        # Partial match
        for user_type in user_types_lower:
            if user_type in job_type_lower or job_type_lower in user_type:
                return 0.7
        
        return 0.0
    
    def _calculate_experience_score(self, user_experience: int, job: Job) -> float:
        """Calculate experience level matching score"""
        if user_experience == 0:
            return 0.5  # Neutral for beginners
        
        # Extract experience requirements from job description
        job_text = f"{job.description} {job.requirements or ''}".lower()
        
        # Look for experience keywords
        if 'fresher' in job_text or 'beginner' in job_text or 'entry level' in job_text:
            required_exp = 0
        elif 'experienced' in job_text or 'senior' in job_text:
            required_exp = 5
        else:
            # Extract numbers followed by 'year' or 'years'
            import re
            exp_matches = re.findall(r'(\d+)\s*(?:year|yr)', job_text)
            required_exp = int(exp_matches[0]) if exp_matches else 2
        
        # Score based on experience match
        exp_diff = abs(user_experience - required_exp)
        if exp_diff == 0:
            return 1.0
        elif exp_diff <= 2:
            return 0.8
        elif exp_diff <= 5:
            return 0.6
        else:
            return 0.3
    
    def _calculate_verification_score(self, user: User) -> float:
        """Calculate verification bonus score"""
        if user.verificationLevel == 'premium':
            return 1.0
        elif user.verificationLevel == 'verified' or user.isVerified:
            return 0.7
        else:
            return 0.3
    
    def _calculate_rating_score(self, rating: float) -> float:
        """Calculate rating bonus score"""
        if rating >= 4.5:
            return 1.0
        elif rating >= 4.0:
            return 0.8
        elif rating >= 3.5:
            return 0.6
        elif rating >= 3.0:
            return 0.4
        else:
            return 0.2
    
    def _filter_by_location(self, jobs, user_location: Tuple[float, float], max_distance_km: float):
        """Filter jobs by location within specified distance"""
        filtered_jobs = []
        user_lat, user_lng = user_location
        
        for job in jobs:
            if job.latitude and job.longitude:
                distance = self._calculate_distance(
                    (user_lat, user_lng), 
                    (job.latitude, job.longitude)
                )
                if distance <= max_distance_km:
                    filtered_jobs.append(job)
            else:
                # Include jobs without location data
                filtered_jobs.append(job)
        
        return filtered_jobs
    
    def _calculate_distance(self, loc1: Tuple[float, float], loc2: Tuple[float, float]) -> float:
        """Calculate distance between two coordinates using Haversine formula"""
        if not loc1 or not loc2:
            return float('inf')
        
        lat1, lng1 = loc1
        lat2, lng2 = loc2
        
        # Convert to radians
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Earth's radius in kilometers
        r = 6371
        
        return c * r
    
    def _get_match_reasons(self, user: User, job: Job) -> List[str]:
        """Get reasons why this job matches the user"""
        reasons = []
        
        # Skill matches
        user_skills = [skill.lower() for skill in (user.skills or [])]
        job_text = f"{job.title} {job.description}".lower()
        
        for skill in user_skills:
            if skill in job_text:
                reasons.append(f"Matches your {skill} skills")
        
        # Job type match
        user_job_types = [jt.lower() for jt in (user.JobTypes or [])]
        if job.jobType and job.jobType.lower() in user_job_types:
            reasons.append(f"Matches your preferred job type: {job.jobType}")
        
        # Verification bonus
        if user.isVerified:
            reasons.append("You're a verified worker")
        
        # Rating bonus
        if user.averageRating >= 4.0:
            reasons.append(f"Your high rating ({user.averageRating:.1f}★) makes you a preferred candidate")
        
        return reasons[:3]  # Limit to top 3 reasons

# Global instance
recommendation_engine = JobRecommendationEngine()
