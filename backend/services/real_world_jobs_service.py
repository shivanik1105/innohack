import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from worker.models import Job
import logging

logger = logging.getLogger(__name__)

class RealWorldJobsService:
    """Service to generate realistic nearby jobs based on user location"""
    
    def __init__(self):
        # Major Indian cities with coordinates
        self.indian_cities = {
            'Delhi': (28.6139, 77.2090),
            'Mumbai': (19.0760, 72.8777),
            'Bangalore': (12.9716, 77.5946),
            'Hyderabad': (17.3850, 78.4867),
            'Chennai': (13.0827, 80.2707),
            'Kolkata': (22.5726, 88.3639),
            'Pune': (18.5204, 73.8567),
            'Ahmedabad': (23.0225, 72.5714),
            'Jaipur': (26.9124, 75.7873),
            'Lucknow': (26.8467, 80.9462),
            'Kanpur': (26.4499, 80.3319),
            'Nagpur': (21.1458, 79.0882),
            'Indore': (22.7196, 75.8577),
            'Thane': (19.2183, 72.9781),
            'Bhopal': (23.2599, 77.4126),
            'Visakhapatnam': (17.6868, 83.2185),
            'Pimpri': (18.6298, 73.7997),
            'Patna': (25.5941, 85.1376),
            'Vadodara': (22.3072, 73.1812),
            'Ghaziabad': (28.6692, 77.4538),
            'Ludhiana': (30.9010, 75.8573),
            'Agra': (27.1767, 78.0081),
            'Nashik': (19.9975, 73.7898),
            'Faridabad': (28.4089, 77.3178),
            'Meerut': (28.9845, 77.7064),
            'Rajkot': (22.3039, 70.8022),
            'Kalyan': (19.2437, 73.1355),
            'Vasai': (19.4911, 72.8054),
            'Varanasi': (25.3176, 82.9739),
            'Srinagar': (34.0837, 74.7973),
            'Aurangabad': (19.8762, 75.3433),
            'Dhanbad': (23.7957, 86.4304),
            'Amritsar': (31.6340, 74.8723),
            'Navi Mumbai': (19.0330, 73.0297),
            'Allahabad': (25.4358, 81.8463),
            'Ranchi': (23.3441, 85.3096),
            'Howrah': (22.5958, 88.2636),
            'Coimbatore': (11.0168, 76.9558),
            'Jabalpur': (23.1815, 79.9864),
            'Gwalior': (26.2183, 78.1828)
        }
        
        # Realistic job templates for blue-collar workers
        self.job_templates = [
            {
                'title': 'Plumber Required for Residential Project',
                'description': 'Need experienced plumber for bathroom renovation work. Must have knowledge of pipe fitting, leak repair, and bathroom fixtures installation.',
                'jobType': 'Plumber',
                'requirements': 'Minimum 2 years experience, own tools preferred',
                'wage_range': (800, 1500),
                'duration_days': (1, 5)
            },
            {
                'title': 'Electrician for Office Wiring',
                'description': 'Seeking qualified electrician for commercial office electrical work. Installation of lights, switches, and power outlets required.',
                'jobType': 'Electrician',
                'requirements': 'ITI certificate preferred, 3+ years experience',
                'wage_range': (1000, 2000),
                'duration_days': (2, 7)
            },
            {
                'title': 'House Painter - Interior Work',
                'description': 'Professional painter needed for 3BHK apartment interior painting. Wall preparation, primer, and finish painting required.',
                'jobType': 'Painter',
                'requirements': 'Experience with interior painting, quality finish',
                'wage_range': (600, 1200),
                'duration_days': (3, 8)
            },
            {
                'title': 'Carpenter for Furniture Assembly',
                'description': 'Skilled carpenter required for custom furniture making and assembly. Kitchen cabinets and wardrobes work.',
                'jobType': 'Carpenter',
                'requirements': 'Woodworking skills, precision work',
                'wage_range': (900, 1800),
                'duration_days': (5, 15)
            },
            {
                'title': 'Construction Helper Needed',
                'description': 'Construction site helper required for building construction. Assist masons, carry materials, general site work.',
                'jobType': 'Construction Helper',
                'requirements': 'Physical fitness, willingness to work',
                'wage_range': (500, 800),
                'duration_days': (10, 30)
            },
            {
                'title': 'AC Technician for Installation',
                'description': 'Air conditioning technician needed for residential AC installation and maintenance work.',
                'jobType': 'AC Technician',
                'requirements': 'AC repair experience, electrical knowledge',
                'wage_range': (1200, 2500),
                'duration_days': (1, 3)
            },
            {
                'title': 'Welder for Metal Fabrication',
                'description': 'Experienced welder required for metal gate and grill fabrication work. Arc welding and gas cutting skills needed.',
                'jobType': 'Welder',
                'requirements': 'Welding certification, 2+ years experience',
                'wage_range': (1000, 2000),
                'duration_days': (3, 10)
            },
            {
                'title': 'Mason for Building Construction',
                'description': 'Skilled mason needed for residential building construction. Brick laying, plastering, and finishing work.',
                'jobType': 'Mason',
                'requirements': 'Masonry experience, quality workmanship',
                'wage_range': (800, 1500),
                'duration_days': (15, 45)
            },
            {
                'title': 'Cleaning Staff for Office',
                'description': 'Office cleaning staff required for daily cleaning and maintenance of commercial office space.',
                'jobType': 'Cleaner',
                'requirements': 'Reliability, attention to detail',
                'wage_range': (400, 700),
                'duration_days': (30, 90)
            },
            {
                'title': 'Driver for Delivery Service',
                'description': 'Delivery driver needed for local goods transportation. Must have valid driving license and know local routes.',
                'jobType': 'Driver',
                'requirements': 'Valid driving license, local area knowledge',
                'wage_range': (600, 1200),
                'duration_days': (7, 30)
            },
            {
                'title': 'Gardener for Residential Society',
                'description': 'Gardener required for maintaining residential society garden. Plant care, watering, and landscaping work.',
                'jobType': 'Gardener',
                'requirements': 'Gardening knowledge, plant care experience',
                'wage_range': (500, 900),
                'duration_days': (30, 180)
            },
            {
                'title': 'Security Guard - Night Shift',
                'description': 'Security guard needed for night shift duty at residential complex. Monitoring and safety responsibilities.',
                'jobType': 'Security Guard',
                'requirements': 'Security training preferred, night shift availability',
                'wage_range': (600, 1000),
                'duration_days': (30, 365)
            }
        ]
    
    def generate_nearby_jobs(self, user_location: Tuple[float, float], radius_km: float = 25, count: int = 20) -> List[Dict]:
        """Generate realistic jobs near user location"""
        if not user_location:
            # If no user location, use Delhi as default
            user_location = self.indian_cities['Delhi']
        
        user_lat, user_lng = user_location
        generated_jobs = []
        
        for i in range(count):
            # Select random job template
            template = random.choice(self.job_templates)
            
            # Generate random location within radius
            job_lat, job_lng = self._generate_nearby_location(user_lat, user_lng, radius_km)
            
            # Find nearest city for location context
            nearest_city = self._find_nearest_city(job_lat, job_lng)
            
            # Generate job details
            wage_min, wage_max = template['wage_range']
            duration_min, duration_max = template['duration_days']
            
            job_data = {
                'title': template['title'],
                'description': template['description'],
                'jobType': template['jobType'],
                'requirements': template['requirements'],
                'wage': random.randint(wage_min, wage_max),
                'location': f"{nearest_city}, India",
                'latitude': job_lat,
                'longitude': job_lng,
                'duration_days': random.randint(duration_min, duration_max),
                'posted_date': datetime.now() - timedelta(days=random.randint(0, 7)),
                'urgency': random.choice(['low', 'medium', 'high']),
                'employer_rating': round(random.uniform(3.5, 5.0), 1),
                'distance_km': self._calculate_distance((user_lat, user_lng), (job_lat, job_lng))
            }
            
            generated_jobs.append(job_data)
        
        # Sort by distance
        generated_jobs.sort(key=lambda x: x['distance_km'])
        
        return generated_jobs
    
    def _generate_nearby_location(self, center_lat: float, center_lng: float, radius_km: float) -> Tuple[float, float]:
        """Generate random location within specified radius"""
        # Convert radius to degrees (approximate)
        radius_deg = radius_km / 111.0  # 1 degree ≈ 111 km
        
        # Generate random angle and distance
        angle = random.uniform(0, 2 * math.pi)
        distance = random.uniform(0, radius_deg)
        
        # Calculate new coordinates
        lat = center_lat + distance * math.cos(angle)
        lng = center_lng + distance * math.sin(angle)
        
        return lat, lng
    
    def _find_nearest_city(self, lat: float, lng: float) -> str:
        """Find nearest city to given coordinates"""
        min_distance = float('inf')
        nearest_city = 'Delhi'  # Default
        
        for city, (city_lat, city_lng) in self.indian_cities.items():
            distance = self._calculate_distance((lat, lng), (city_lat, city_lng))
            if distance < min_distance:
                min_distance = distance
                nearest_city = city
        
        return nearest_city
    
    def _calculate_distance(self, loc1: Tuple[float, float], loc2: Tuple[float, float]) -> float:
        """Calculate distance between two coordinates using Haversine formula"""
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
    
    def create_jobs_in_database(self, user_location: Tuple[float, float], count: int = 50):
        """Create realistic jobs in database for testing"""
        job_data_list = self.generate_nearby_jobs(user_location, radius_km=50, count=count)
        
        created_jobs = []
        for job_data in job_data_list:
            try:
                job = Job.objects.create(
                    title=job_data['title'],
                    description=job_data['description'],
                    jobType=job_data['jobType'],
                    requirements=job_data['requirements'],
                    wage=job_data['wage'],
                    payPerDay=job_data['wage'],  # Set payPerDay to same as wage
                    location=job_data['location'],
                    latitude=job_data['latitude'],
                    longitude=job_data['longitude'],
                    postedAt=job_data['posted_date'],
                    status='open',
                    pincode='110001',  # Default pincode
                    contractorContact='+91-9876543210'  # Default contact
                )
                created_jobs.append(job)
            except Exception as e:
                logger.error(f"Error creating job: {str(e)}")
        
        return created_jobs

# Global instance
real_world_jobs_service = RealWorldJobsService()
