export interface Worker {
  id: string;
  phoneNumber: string;
  name: string;
  age: number;
  pinCode: string;
  photo?: string;
  gender?: 'male' | 'female' | string;
  aadhaarNumber: string;
  aadhaarCardImage: string | null | undefined;
  email?: string;
  dateOfBirth?: string;
  workerType: 'daily' | 'skilled' | 'semi-skilled';
  isAvailableToday: boolean;
  jobTypes: string[];
  skills?: string[];
  certifications?: Certification[];
  portfolio?: PortfolioItem[];
  rating: number;
  totalJobs: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  language: string;
}

export interface Certification {
  id: string;
  type: 'government' | 'ngo' | 'private' | 'reference';
  title: string;
  imageUrl: string;
  ipfsHash?: string;
  isVerified: boolean;
  uploadedAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  completedAt: string;
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