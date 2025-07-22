export interface Worker {
  id: string;
  phoneNumber: string;
  name: string;
  age: number;
  pinCode: string;
  photo?: string;
  workerType: 'daily' | 'skilled';
  isAvailableToday: boolean;
  jobTypes: string[];
  skills?: string[];
  certifications?: Certification[];
  portfolio?: PortfolioItem[];
  rating: number;
  totalJobs: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
}

export interface Certification {
  id: string;
  type: 'government' | 'ngo' | 'private' | 'reference';
  title: string;
  imageUrl: string;
  ipfsHash?: string;
  isVerified: boolean;
  uploadedAt: Date;
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  completedAt: Date;
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
  workDate: Date;
  paidAt?: Date;
}