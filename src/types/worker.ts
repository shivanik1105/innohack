export interface Worker {
  id: string;
  phoneNumber: string;
  name: string;
  age: number;
  pinCode: string;
  photo?: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  aadhaarNumber: string;
  aadhaarCardImage: string | null | undefined;
  email: string;
  dateOfBirth: string; // Required field in YYYY-MM-DD format
  workerType: 'daily' | 'skilled' | 'semi-skilled';
  isAvailableToday: boolean;
  jobTypes: string[];
  skills?: string[];
  certifications?: Certification[];
  portfolio?: PortfolioItem[];
  rating: number;
  totalJobs: number;
  verificationStatus: 'pending' | 'verified' | 'premium';
  createdAt: string;
  language: string;
  // New fields for enhanced functionality
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notifications?: Notification[];
}

export interface Certification {
  id: string;
  type: 'government' | 'ngo' | 'private' | 'reference';
  title: string;
  imageUrl: string;
  ipfsHash?: string;
  isVerified: boolean;
  verificationData: any;
  uploadedAt: string;
  verifiedAt?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  completedAt: string;
  skills: string[];
  createdAt: string;
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
  postedAt: Date;
  status: 'open' | 'filled' | 'completed';
  companyLogo?: string;
  companyPhotos?: string[];
}

export interface PaymentLog {
  id: string;
  workerId: string;
  jobId: string;
  amount: number;
  status: 'paid' | 'pending';
  workDate: string;
  paidAt?: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'job_match' | 'rating' | 'payment' | 'verification' | 'general';
  isRead: boolean;
  createdAt: string;
  jobId?: string;
  actionUrl?: string;
}