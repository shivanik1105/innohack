#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

# Add the project directory to the Python path
sys.path.append(str(Path(__file__).resolve().parent))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from worker.models import Job

def create_sample_jobs():
    print("Creating sample jobs...")
    
    # Sample jobs data
    jobs_data = [
        {
            'title': 'सफाई का काम / Cleaning Work',
            'description': 'ऑफिस की सफाई / Office cleaning required',
            'payPerDay': 800.00,
            'location': 'Connaught Place, Delhi',
            'pincode': '110001',
            'contractorContact': '9876543210',
            'contractorName': 'राम कुमार / Ram Kumar',
            'jobType': 'cleaner',
            'requiredWorkers': 2,
            'duration': '1 day',
            'status': 'open'
        },
        {
            'title': 'लोडिंग का काम / Loading Work',
            'description': 'सामान लादना / Load goods from warehouse',
            'payPerDay': 1000.00,
            'location': 'Karol Bagh, Delhi',
            'pincode': '110005',
            'contractorContact': '9876543211',
            'contractorName': 'श्याम सिंह / Shyam Singh',
            'jobType': 'loader',
            'requiredWorkers': 5,
            'duration': '2 days',
            'status': 'open'
        },
        {
            'title': 'ड्राइवर का काम / Driver Work',
            'description': 'ट्रक चलाना / Drive delivery truck',
            'payPerDay': 1200.00,
            'location': 'Nehru Place, Delhi',
            'pincode': '110019',
            'contractorContact': '9876543212',
            'contractorName': 'मोहन लाल / Mohan Lal',
            'jobType': 'driver',
            'requiredWorkers': 1,
            'duration': '3 days',
            'status': 'open'
        },
        {
            'title': 'Construction Helper',
            'description': 'Help with construction work',
            'payPerDay': 900.00,
            'location': 'Gurgaon',
            'pincode': '122001',
            'contractorContact': '9876543213',
            'contractorName': 'Rajesh Kumar',
            'jobType': 'construction',
            'requiredWorkers': 10,
            'duration': '1 week',
            'status': 'open'
        },
        {
            'title': 'Plumber Work',
            'description': 'Fix pipes and plumbing issues',
            'payPerDay': 1500.00,
            'location': 'Noida',
            'pincode': '201301',
            'contractorContact': '9876543214',
            'contractorName': 'Suresh Sharma',
            'jobType': 'plumber',
            'requiredWorkers': 2,
            'duration': '2 days',
            'status': 'open'
        },
        {
            'title': 'Electrician Work',
            'description': 'Electrical installation and repair',
            'payPerDay': 1400.00,
            'location': 'Faridabad',
            'pincode': '121001',
            'contractorContact': '9876543215',
            'contractorName': 'Amit Verma',
            'jobType': 'electrician',
            'requiredWorkers': 3,
            'duration': '1 day',
            'status': 'open'
        }
    ]
    
    # Create jobs
    created_count = 0
    for job_data in jobs_data:
        job, created = Job.objects.get_or_create(
            title=job_data['title'],
            defaults=job_data
        )
        if created:
            created_count += 1
            print(f"✅ Created job: {job.title}")
        else:
            print(f"⚠️  Job already exists: {job.title}")
    
    print(f"\n🎉 Created {created_count} new jobs!")
    print(f"📊 Total jobs in database: {Job.objects.count()}")

if __name__ == '__main__':
    create_sample_jobs()
