#!/usr/bin/env python
"""
Script to populate the database with realistic jobs for testing
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from services.real_world_jobs_service import real_world_jobs_service
from worker.models import User

def populate_jobs():
    """Populate database with realistic jobs"""
    print("🚀 Starting job population...")
    
    # Get a sample user location or use Delhi as default
    try:
        sample_user = User.objects.first()
        if sample_user and sample_user.latitude and sample_user.longitude:
            user_location = (sample_user.latitude, sample_user.longitude)
            print(f"📍 Using user location: {user_location}")
        else:
            # Default to Delhi
            user_location = (28.6139, 77.2090)
            print(f"📍 Using default location (Delhi): {user_location}")
    except:
        user_location = (28.6139, 77.2090)
        print(f"📍 Using default location (Delhi): {user_location}")
    
    # Create jobs in different areas
    locations = [
        (28.6139, 77.2090),  # Delhi
        (19.0760, 72.8777),  # Mumbai
        (12.9716, 77.5946),  # Bangalore
        (17.3850, 78.4867),  # Hyderabad
        (13.0827, 80.2707),  # Chennai
    ]
    
    total_jobs_created = 0
    
    for location in locations:
        print(f"🏗️ Creating jobs near {location}...")
        try:
            jobs = real_world_jobs_service.create_jobs_in_database(location, count=20)
            total_jobs_created += len(jobs)
            print(f"✅ Created {len(jobs)} jobs near {location}")
        except Exception as e:
            print(f"❌ Error creating jobs near {location}: {str(e)}")
    
    print(f"🎉 Job population complete! Created {total_jobs_created} total jobs.")
    
    # Print some statistics
    from worker.models import Job
    total_jobs = Job.objects.count()
    job_types = Job.objects.values_list('jobType', flat=True).distinct()
    
    print(f"\n📊 Database Statistics:")
    print(f"   Total jobs: {total_jobs}")
    print(f"   Job types: {list(job_types)}")
    print(f"   Open jobs: {Job.objects.filter(status='open').count()}")

if __name__ == '__main__':
    populate_jobs()
