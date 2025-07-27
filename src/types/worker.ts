// This file defines the "rulebook" for your data types in the frontend.
// It should match your Django models.

// New interface for Certification, based on your code
export interface Certification {
  label: string;
  url: string;
  verified: boolean;
}

// New interface for PortfolioItem, based on your code
export interface PortfolioItem {
  title: string;
  imageUrl: string;
  description?: string;
}

export interface Worker {
  uid: string; // Changed from 'id' to match Firebase and backend
  userType: 'daily' | 'skilled';
  name: string;
  age?: number;
  pincode: string; // Standardized to 'pincode'
  phoneNumber: string;
  createdAt: string; // Dates from JSON are strings

  // Daily worker fields
  dailyJobTypes: string[];
  isAvailableToday?: boolean;
  // Skilled worker fields
  profilePhotoUrl?: string; // Standardized to 'profilePhotoUrl'
  skills: string[];
  isVerified: boolean;
  certifications?: Certification[]; // Added from your code
  portfolio?: PortfolioItem[]; // Added from your code
  averageRating: number; // Standardized to 'averageRating'
  jobsCompleted: number; // Standardized to 'jobsCompleted'
  
  // New fields from your code
  language?: string;
  experience?: number;
  location?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  payPerDay: number;
  location: string;
  pinCode: string;
  contactNumber: string;
  contractorName: string;
  jobType: string;
  requiredWorkers: number;
  duration: string;
  postedAt: Date; // Assuming this is converted to a Date object on the frontend
  status: 'open' | 'in_progress' | 'completed';
}

// You can add other types here as needed
export interface PaymentLog {
    id: string;
    jobId: string;
    jobTitle: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Pending';
}
