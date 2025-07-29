import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Calendar,
  User,
  ToggleLeft,
  ToggleRight,
  Home,
  Wallet,
  Briefcase,
  Bell,
  LogOut,
  Edit,
  Mail,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Filter,
  Navigation,
  Shield,
  Upload,
  Camera,
  FileText,
  Award,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Worker, Job } from '../types/worker';
import LocationSelector from './LocationSelector';
import VerificationBadge, { VerificationCard, SkillBadge, RatingBadge } from './VerificationBadge';
import PortfolioManager from './PortfolioManager';
import CertificateUpload from './CertificateUpload';
import CoursesManager from './CoursesManager';
import NotificationCenter from './NotificationCenter';
import { useTranslation } from 'react-i18next';
import { getJobRecommendations } from '../services/apiService';
import { localizeNumber, localizePhoneNumber, localizePincode } from '../utils/numberLocalization';

interface WorkerDashboardProps {
  worker: Worker;
  onUpdateWorker: (worker: Worker) => void;
  initialLanguage?: string; 
  language: 'en' | 'hi' | 'mr';
}

// Remove specific job type filters - show all jobs

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'सफाई का काम / Cleaning Work',
    description: 'ऑफिस की सफाई / Office cleaning',
    payPerDay: 800,
    location: 'Tech Mahindra Office, Block A, Sector 59, Noida',
    pinCode: '201301',
    contactNumber: '9876543210',
    contractorName: 'राम कुमार / Ram Kumar',
    jobType: 'cleaner',
    requiredWorkers: 2,
    duration: '1 दिन / 1 day',
    postedAt: new Date(),
    status: 'open',
    companyLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
    companyPhotos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=300&h=200&fit=crop'
    ]
  },
  {
    id: '2',
    title: 'लोडिंग का काम / Loading Work',
    description: 'सामान लादना / Load goods',
    payPerDay: 1000,
    location: 'Reliance Warehouse, Plot 15, Industrial Area, Faridabad',
    pinCode: '121003',
    contactNumber: '9876543211',
    contractorName: 'श्याम सिंह / Shyam Singh',
    jobType: 'loader',
    requiredWorkers: 5,
    duration: '2 दिन / 2 days',
    postedAt: new Date(),
    status: 'open',
    companyLogo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&h=100&fit=crop&crop=center',
    companyPhotos: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop'
    ]
  },
  {
    id: '3',
    title: 'निर्माण कार्य / Construction Work',
    description: 'भवन निर्माण / Building construction',
    payPerDay: 1200,
    location: 'DLF Cyber City, Building 10, Sector 24, Gurgaon',
    pinCode: '122002',
    contactNumber: '9876543212',
    contractorName: 'मोहन लाल / Mohan Lal',
    jobType: 'construction',
    requiredWorkers: 8,
    duration: '5 दिन / 5 days',
    postedAt: new Date(),
    status: 'open'
  },
  {
    id: '4',
    title: 'पैकेजिंग कार्य / Packaging Work',
    description: 'उत्पाद पैकेजिंग / Product packaging',
    payPerDay: 900,
    location: 'Amazon Fulfillment Center, Sector 81, Greater Noida',
    pinCode: '201306',
    contactNumber: '9876543213',
    contractorName: 'सुनील कुमार / Sunil Kumar',
    jobType: 'packaging',
    requiredWorkers: 12,
    duration: '3 दिन / 3 days',
    postedAt: new Date(),
    status: 'open'
  },
  {
    id: '5',
    title: 'बागवानी कार्य / Gardening Work',
    description: 'पार्क की देखभाल / Park maintenance',
    payPerDay: 700,
    location: 'Central Park, Rajouri Garden, New Delhi',
    pinCode: '110027',
    contactNumber: '9876543214',
    contractorName: 'राजेश वर्मा / Rajesh Verma',
    jobType: 'gardening',
    requiredWorkers: 4,
    duration: '2 दिन / 2 days',
    postedAt: new Date(),
    status: 'open'
  }
];

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  notification?: number;
}

export default function EnhancedWorkerDashboard({ worker: propWorker, onUpdateWorker }: WorkerDashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState<'jobs' | 'profile' | 'payments' | 'aadhaar' | 'certificates' | 'portfolio' | 'courses'>('jobs');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [locationFilter, setLocationFilter] = useState<'nearby' | 'all'>('nearby');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCount] = useState(3);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedWorker, setEditedWorker] = useState<Worker | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiRecommendationInfo, setAiRecommendationInfo] = useState<any>(null);

  useEffect(() => {
    const storedLang = localStorage.getItem('appLanguage');
    if (storedLang === 'hi' || storedLang === 'mr' || storedLang === 'en') {
      i18n.changeLanguage(storedLang);
    }
  }, []);

  const [worker, setWorker] = useState<Worker | null>(() => {
    const workerData = propWorker || location.state?.worker;
    if (workerData) {
      return {
        ...workerData,
        language: workerData.language || 'mr' 
      };
    }
    return null;
  });

  useEffect(() => {
    if (worker) {
      setEditedWorker({ ...worker });
    }
  }, [worker]);



  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('worker');
    sessionStorage.clear();
    // Navigate back to login
    navigate('/');
  };

  const handleAadhaarUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file || !worker) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('File size must be less than 5MB'));
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert(t('Please upload a valid image (JPG, PNG) or PDF file'));
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('aadhaar_image', file);
      formData.append('name', worker.name);
      formData.append('aadhaarNumber', worker.aadhaarNumber || '');
      formData.append('gender', worker.gender || '');

      // Show loading state
      console.log(t('Verifying Aadhaar card...'));

      // Send to backend for verification
      const response = await fetch('/api/verify-aadhaar/', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Convert file to base64 for display
        const reader = new FileReader();
        reader.onload = (e) => {
          const updatedWorker = {
            ...worker,
            aadhaarCardImage: e.target?.result as string,
            verificationStatus: (result.verification_status === 'verified' ? 'verified' : 'pending') as 'pending' | 'verified' | 'premium'
          };
          onUpdateWorker(updatedWorker);
        };
        reader.readAsDataURL(file);

        alert(t('Aadhaar card uploaded and verified successfully!'));
      } else {
        alert(t('Aadhaar verification failed: ') + (result.error || t('Unknown error')));
      }
    } catch (error) {
      console.error('Aadhaar upload error:', error);
      alert(t('Failed to upload Aadhaar card. Please try again.'));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        setShowImageEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = () => {
    if (selectedImage && editedWorker) {
      setEditedWorker({ ...editedWorker, photo: selectedImage });
      setShowImageEditor(false);
      setSelectedImage(null);
    }
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorker(updatedWorker);
    if (onUpdateWorker) {
      onUpdateWorker(updatedWorker);
    }
  };

  const toggleAvailability = () => {
    if (!worker) return;
    handleUpdateWorker({ 
      ...worker, 
      isAvailableToday: !worker.isAvailableToday 
    });
  };

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch AI recommendations when component loads
  useEffect(() => {
    if (worker?.id && activeTab === 'jobs') {
      fetchJobRecommendations();
    }
  }, [worker?.id, activeTab]);

  // Use recommended jobs if available, otherwise fall back to mock jobs
  const jobsToFilter = recommendedJobs.length > 0 ? recommendedJobs : mockJobs;

  const filteredJobs = jobsToFilter.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      (locationFilter === 'nearby'
        ? worker?.pinCode &&
          job?.pinCode &&
          job.pinCode.startsWith(worker.pinCode.slice(0, 3))
        : true) && matchesSearch
    );
  });

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber.trim()) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleDirections = (location: string, pinCode: string) => {
    // Check if we have valid location data
    if (!location || !location.trim()) {
      alert('Location information not available');
      return;
    }

    // Get user's current location and open Google Maps with directions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const destination = pinCode ? `${location}, ${pinCode}` : location;
          const mapsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${encodeURIComponent(destination)}`;
          window.open(mapsUrl, '_blank');
        },
        () => {
          // Fallback: open Google Maps with just the destination
          const destination = pinCode ? `${location}, ${pinCode}` : location;
          const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(destination)}`;
          window.open(mapsUrl, '_blank');
        }
      );
    } else {
      // Fallback for browsers without geolocation
      const destination = pinCode ? `${location}, ${pinCode}` : location;
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(destination)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const fetchJobRecommendations = async () => {
    if (!worker?.id) return;

    setLoadingRecommendations(true);
    try {
      // Make the API call and get the full response
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/recommendations/${worker.id}/`);
      const data = await response.json();

      if (response.ok) {
        // Extract jobs and metadata
        const jobs = data.jobs || data;
        setRecommendedJobs(jobs);
        setAiRecommendationInfo(data);
        console.log('AI Recommendation Info:', data);
      } else {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Failed to fetch job recommendations:', error);
      // Fallback to mock jobs if API fails
      setRecommendedJobs(mockJobs);
      setAiRecommendationInfo(null);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleLocationChoice = (choice: 'nearby' | 'all') => {
    setLocationFilter(choice);
    setShowLocationSelector(false);

    // Fetch AI/ML recommendations when user selects location preference
    if (choice === 'nearby' || choice === 'all') {
      fetchJobRecommendations();
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (editedWorker) {
      handleUpdateWorker(editedWorker);
    }
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (worker) {
      setEditedWorker({ ...worker });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedWorker) {
      setEditedWorker({
        ...editedWorker,
        [e.target.name]: e.target.value
      });
    }
  };

  if (!worker || !editedWorker) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md w-full">
          <div className="text-red-500 mb-4">
            <X size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('workerDataNotFound')}</h2>
          <p className="text-gray-600 mb-4">{t('registerAgainMessage')}</p>
          <button 
            onClick={() => window.location.href = '/register'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('registerNow')}
          </button>
        </div>
      </div>
    );
  }

  const sidebarItems: SidebarItemProps[] = [
    { icon: <Home size={20} />, label: 'jobs', active: activeTab === 'jobs' },
    { icon: <User size={20} />, label: 'profile', active: activeTab === 'profile' },
    { icon: <Wallet size={20} />, label: 'payments', active: activeTab === 'payments' },
    { icon: <User size={20} />, label: 'aadhaar', active: activeTab === 'aadhaar' },
    { icon: <Star size={20} />, label: 'courses', active: activeTab === 'courses' },
    ...(worker.workerType === 'skilled' ? [
      { icon: <FileText size={20} />, label: 'certificates', active: activeTab === 'certificates' },
      { icon: <Camera size={20} />, label: 'portfolio', active: activeTab === 'portfolio' }
    ] : []),
    { icon: <LogOut size={20} />, label: 'logout' }
  ];

  return (
  <div className="flex h-screen bg-gray-50">
    {/* Sidebar */}
    <AnimatePresence>
      {sidebarOpen && (
        <motion.div 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`bg-gradient-to-b from-indigo-700 to-indigo-900 text-white w-80 fixed md:relative h-screen md:h-full z-30 shadow-2xl`}
        >
          <div className="p-5 flex items-center justify-between border-b border-indigo-600">
            <div className="flex items-center space-x-3">
              <Briefcase className="text-amber-300" size={26} />
              <h1 className="text-xl font-bold tracking-tight">WorkerConnect</h1>
            </div>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-amber-200 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="p-5">
            <div className="flex items-center space-x-4 mb-6 p-4 bg-indigo-600 rounded-xl shadow-md">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                {worker.photo ? (
                  <img src={worker.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-indigo-500">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{worker.name}</h3>
                <p className="text-xs text-indigo-100 truncate">
                  {(worker.jobTypes || []).join(', ')}
                </p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (['jobs', 'profile', 'payments', 'aadhaar', 'certificates', 'portfolio'].includes(item.label)) {
                      setActiveTab(item.label as 'jobs' | 'profile' | 'payments' | 'aadhaar' | 'certificates' | 'portfolio');
                    } else if (item.label === 'logout') {
                      handleLogout();
                    }
                    if (isMobile && item.label !== 'logout') {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center w-full p-3 rounded-lg transition-all ${
                    item.active 
                      ? 'bg-white text-indigo-700 shadow-md' 
                      : 'text-indigo-100 hover:bg-indigo-600 hover:bg-opacity-50'
                  }`}
                >
                  <span className={`mr-3 ${item.active ? 'text-indigo-600' : 'text-indigo-200'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{t(`${item.label}`)}</span>
                  {item.notification !== undefined && (
                    <span className="ml-auto bg-amber-400 text-indigo-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.notification}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Footer */}              
          <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-indigo-600">
            <div className="flex items-center justify-between">
              <div className="text-xs text-indigo-200">
                v1.0.0
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Main Content */}
    <div className={`flex-1 transition-all overflow-auto ${sidebarOpen && !isMobile ? 'ml-64' : ''}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="bg-indigo-700 text-white p-4 flex justify-between items-center md:hidden shadow-md">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-indigo-600 transition-colors"
          >
            ☰
          </button>
          <h1 className="text-lg font-bold tracking-tight">WorkerConnect</h1>
          <div className="relative">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-indigo-900 text-xs font-bold px-1.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-5 md:p-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {t("welcome")}, <span className="text-indigo-600">{worker.name.split(' ')[0]}</span>!
            </h1>
            <p className="text-gray-600">
              {activeTab === 'jobs' ? t('findJobsForYou') : 
               activeTab === 'profile' ? t('manageProfileDetails') : 
               activeTab === 'payments' ? t('viewPaymentHistory') :
               t('aadhaarCardTitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Notification Center */}
            <NotificationCenter
              userId={worker.id}
              onNotificationClick={(notification) => {
                // Handle notification click - could navigate to relevant page
                console.log('Notification clicked:', notification);
              }}
            />

            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 md:hidden"
              >
                ☰
              </button>
            )}
            <button 
              onClick={toggleAvailability} 
              className={`flex items-center px-4 py-2.5 rounded-full transition-all ${
                worker.isAvailableToday 
                  ? 'bg-emerald-100 text-emerald-800 shadow-sm' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {worker.isAvailableToday ? (
                <>
                  <ToggleRight className="w-5 h-5 text-emerald-500 mr-2" />
                  <span className="font-medium">{t('available')}</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="font-medium">{t('busy')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['jobs', 'profile', 'payments', 'aadhaar', 'courses', ...(worker.workerType === 'skilled' ? ['certificates', 'portfolio'] : [])]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div>
          {activeTab === 'jobs' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800">{t('findJobsForYou')}</h2>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder={t('searchJobsPlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowLocationSelector(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <Filter size={16} />
                    <span className="font-medium">
                      {locationFilter === 'nearby' ? t('nearbyJobs') : t('allJobs')}
                    </span>
                    {recommendedJobs.length > 0 && (
                      <div className="ml-2 flex items-center gap-1">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          {aiRecommendationInfo?.recommendation_type === 'ai_powered' ? 'AI' : '📍 Basic'}
                        </span>
                        {aiRecommendationInfo?.total_recommendations && (
                          <span className="text-xs text-gray-500">
                            ({aiRecommendationInfo.total_recommendations})
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Recommendation Info Banner */}
              {aiRecommendationInfo?.recommendation_type === 'ai_powered' && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        AI-Powered Recommendations Active
                      </p>
                      <p className="text-xs text-green-600">
                        {aiRecommendationInfo.message} • {aiRecommendationInfo.total_recommendations} jobs found
                      </p>
                    </div>
                  </div>
                </div>
              )}



              <AnimatePresence>
                {showLocationSelector && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white p-6 rounded-xl max-w-sm w-full mx-4 shadow-2xl"
                    >
                      <LocationSelector onLocationChoice={handleLocationChoice} />
                      <button 
                        onClick={() => setShowLocationSelector(false)} 
                        className="mt-4 w-full text-center text-gray-600 hover:text-gray-800 transition-colors font-medium"
                      >
                        {t('cancel')}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingRecommendations ? (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Loading AI Recommendations...</h3>
                  <p className="text-gray-500">Finding the best jobs for you using AI/ML</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
                    alt="No jobs found" 
                    className="w-32 h-32 mx-auto mb-4 opacity-70"
                  />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">{t('noJobsFound')}</h3>
                  <p className="text-gray-500 mb-4">{t('tryChangingFilters')}</p>
                  <button 
                    onClick={() => setLocationFilter(locationFilter === 'nearby' ? 'all' : 'nearby')}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    {locationFilter === 'nearby' ? t('showAllJobs') : t('showNearbyJobs')}
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredJobs.map((job) => (
                    <motion.div 
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                    >
                      <div 
                        className="p-5 cursor-pointer"
                        onClick={() => toggleJobExpansion(job.id)}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">{job.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{job.description}</p>
                          </div>
                          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                            ₹{localizeNumber(job.payPerDay || 0, i18n.language)}/day
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-start text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <span className="flex-1 leading-relaxed">{job.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1.5 text-indigo-600" />
                              <span>{job.duration}</span>
                            </div>
                            <div className="flex items-center">
                              {expandedJobId === job.id ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedJobId === job.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                              {/* Company Information Section */}
                              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="text-xs text-blue-600 font-medium mb-3 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {t('Company Information')}
                                </div>

                                {/* Company Header with Logo */}
                                <div className="flex items-center space-x-3 mb-3">
                                  {job.companyLogo && (
                                    <img
                                      src={job.companyLogo}
                                      alt="Company Logo"
                                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-800 text-sm">
                                      {job.location.split(',')[0]} {/* Extract company name */}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {job.location.split(',').slice(1).join(',').trim()}
                                    </div>
                                  </div>
                                </div>

                                {/* Company Photos */}
                                {job.companyPhotos && job.companyPhotos.length > 0 && (
                                  <div className="mb-3">
                                    <div className="text-xs text-gray-500 mb-2">{t('Company Photos')}:</div>
                                    <div className="flex space-x-2 overflow-x-auto">
                                      {job.companyPhotos.map((photo, index) => (
                                        <img
                                          key={index}
                                          src={photo}
                                          alt={`Company Photo ${index + 1}`}
                                          className="w-16 h-12 rounded object-cover border border-gray-200 flex-shrink-0"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs text-gray-500">{t('Full Address')}:</span>
                                    <div className="font-medium text-gray-800 text-sm leading-relaxed">{job.location}</div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="text-xs text-gray-500">PIN:</span>
                                      <span className="ml-1 font-medium text-gray-700">{localizePincode(job.pinCode || '', i18n.language)}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500">{t('Contact')}:</span>
                                      <span className="ml-1 font-medium text-gray-700">{localizePhoneNumber(job.contactNumber || '', i18n.language)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <div className="text-xs text-gray-500 font-medium mb-1">{t('postedBy')}</div>
                                  <div className="font-medium text-gray-800">{job.contractorName}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 font-medium mb-1">{t('workersNeeded')}</div>
                                  <div className="font-bold text-indigo-600">{localizeNumber(job.requiredWorkers || 0, i18n.language)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 font-medium mb-1">{t('phone')}</div>
                                  <div className="font-medium text-gray-800">{localizePhoneNumber(job.contactNumber || '', i18n.language)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 font-medium mb-1">Duration</div>
                                  <div className="font-medium text-gray-800">{job.duration}</div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => handleCall(job.contactNumber || '')}
                                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center shadow-md hover:shadow-lg font-medium"
                                >
                                  <Phone className="w-4 h-4 mr-2" />
                                  <span>{t('callNow')}</span>
                                </button>
                                <button
                                  onClick={() => handleDirections(job.location || '', job.pinCode || '')}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center shadow-md hover:shadow-lg font-medium"
                                >
                                  <Navigation className="w-4 h-4 mr-2" />
                                  <span>{t('directions')}</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Verification Status Card */}
              {worker.workerType === 'skilled' && (
                <VerificationCard
                  verificationStatus={worker.verificationStatus || 'pending'}
                  certificateCount={worker.certifications?.length || 0}
                  portfolioCount={worker.portfolio?.length || 0}
                />
              )}

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <User className="mr-2 text-indigo-600" size={20} />
                      {t('Personal Information')}
                    </h3>
                    {worker.workerType === 'skilled' && (
                      <VerificationBadge
                        verificationStatus={worker.verificationStatus || 'pending'}
                        size="sm"
                        showText={false}
                      />
                    )}
                  </div>
                  {!isEditingProfile ? (
                    <button 
                      onClick={handleEditProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Edit size={16} />
                      <span>{t('editProfile')}</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        {t('cancel')}
                      </button>
                      <button 
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        {t('saveChanges')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Profile Picture Section */}
                  <div className="md:col-span-2 flex flex-col items-center mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md mb-4">
                      {worker.photo ? (
                        <img src={worker.photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                          <User className="w-10 h-10 text-gray-500" />
                        </div>
                      )}
                    </div>
                    {isEditingProfile && (
                      <div className="flex gap-2">
                        <label className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                          {t('Edit Picture')}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => editedWorker && setEditedWorker({ ...editedWorker, photo: undefined })}
                          className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          {t('remove')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Basic Info Section */}
                  <div className="md:col-span-2">
                    <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Basic Info</h4>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs text-gray-500 block mb-1">{t('name')}</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="name"
                        value={editedWorker.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="font-medium text-gray-800">{worker.name}</div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs text-gray-500 block mb-1">
                      {t('Date of Birth')}
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editedWorker.dateOfBirth || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={t('dateFormat')}
                      />
                    ) : (
                      <div className="font-medium text-gray-800">
                        {worker.dateOfBirth ?
                          new Date(worker.dateOfBirth).toLocaleDateString(i18n.language) :
                          t('Not specified')}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs text-gray-500 block mb-1">
                      {t('Gender')}
                    </label>
                    {isEditingProfile ? (
                      <select
                        name="gender"
                        value={editedWorker.gender || ''}
                        onChange={(e) => setEditedWorker({ 
                          ...editedWorker, 
                          gender: e.target.value as 'male' | 'female' | 'other' | 'prefer-not-to-say' 
                        })}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                      </select>
                    ) : (
                      <div className="font-medium text-gray-800">
                        {worker.gender ?
                          t(`${worker.gender}`) :
                          t('Not specified')}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs text-gray-500 block mb-1">
                      {t('Email')}
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        name="email"
                        value={editedWorker.email || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={t('emailPlaceholder')}
                      />
                    ) : (
                      <div className="font-medium text-gray-800 flex items-center">
                        <Mail className="mr-2 text-indigo-600" size={16} />
                        {worker.email || t('Not specified')}
                      </div>
                    )}
                  </div>
                  {/* Account Info Section */}
                  <div className="md:col-span-2 mt-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Account Info</h4>
                  </div>

                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs text-gray-500 block mb-1">{t('Aadhaar Number')}</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={editedWorker.aadhaarNumber || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="font-medium text-gray-800">{worker.aadhaarNumber || t('Not specified')}</div>
                    )}
                  </div>

                  {/* Contact Info Section */}
                  <div className="md:col-span-2 mt-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Contact Info</h4>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs text-gray-500 block mb-1">{t('phone')}</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editedWorker.phoneNumber || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="font-medium text-gray-800">{worker.phoneNumber || 'Not specified'}</div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs text-gray-500 block mb-1">{t('pinCode')}</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="pinCode"
                        value={editedWorker.pinCode || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="font-medium text-gray-800">{worker.pinCode || 'Not specified'}</div>
                    )}
                  </div>

                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                  <Briefcase className="mr-2 text-indigo-600" size={20} /> 
                  {t('jobTypes')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(worker.jobTypes || []).map((type) => (
                    <span
                      key={type}
                      className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

            {activeTab === 'payments' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Payment Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">{t('Total Earnings')}</p>
                        <p className="text-2xl font-bold">₹{localizeNumber(45750, i18n.language)}</p>
                      </div>
                      <Wallet className="h-8 w-8 text-green-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">{t('This Month')}</p>
                        <p className="text-2xl font-bold">₹{localizeNumber(8500, i18n.language)}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">{t('Pending')}</p>
                        <p className="text-2xl font-bold">₹{localizeNumber(2300, i18n.language)}</p>
                      </div>
                      <Star className="h-8 w-8 text-purple-200" />
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">{t('Recent Payments')}</h3>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {[
                      {
                        id: 1,
                        jobTitle: t('House Painting - Interior Work'),
                        employer: 'Rajesh Kumar',
                        amount: 3500,
                        date: '2024-01-15',
                        status: 'completed',
                        paymentMethod: 'UPI'
                      },
                      {
                        id: 2,
                        jobTitle: t('Electrical Wiring Installation'),
                        employer: 'Priya Sharma',
                        amount: 2800,
                        date: '2024-01-12',
                        status: 'completed',
                        paymentMethod: 'Bank Transfer'
                      },
                      {
                        id: 3,
                        jobTitle: t('Plumbing Repair Work'),
                        employer: 'Amit Singh',
                        amount: 1500,
                        date: '2024-01-10',
                        status: 'completed',
                        paymentMethod: 'Cash'
                      },
                      {
                        id: 4,
                        jobTitle: t('Kitchen Renovation'),
                        employer: 'Sunita Devi',
                        amount: 2300,
                        date: '2024-01-08',
                        status: 'pending',
                        paymentMethod: 'UPI'
                      },
                      {
                        id: 5,
                        jobTitle: t('Bathroom Tile Work'),
                        employer: 'Vikram Patel',
                        amount: 4200,
                        date: '2024-01-05',
                        status: 'completed',
                        paymentMethod: 'Bank Transfer'
                      }
                    ].map((payment) => (
                      <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className={`w-3 h-3 rounded-full ${
                                  payment.status === 'completed' ? 'bg-green-500' :
                                  payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {payment.jobTitle}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {t('Employer')}: {payment.employer}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(payment.date).toLocaleDateString(i18n.language)} • {payment.paymentMethod}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                ₹{localizeNumber(payment.amount, i18n.language)}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {t(payment.status)}
                              </span>
                            </div>

                            {payment.status === 'completed' && (
                              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                {t('Download Receipt')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-gray-50 text-center">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                      {t('View All Payments')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'aadhaar' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Aadhaar Card Section */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <FileText className="mr-2 text-indigo-600" size={24} />
                      {t('Aadhaar Card Verification')}
                    </h3>
                    {worker.verificationStatus && (
                      <VerificationBadge
                        verificationStatus={worker.verificationStatus}
                        size="sm"
                      />
                    )}
                  </div>

                  {worker.aadhaarCardImage ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Uploaded Card Display */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700">{t('Uploaded Aadhaar Card')}</h4>
                        <img
                          src={worker.aadhaarCardImage}
                          alt="Aadhaar Card"
                          className="w-full rounded-lg shadow-md border"
                        />
                        <div className="text-sm text-gray-600">
                          <p><strong>{t('Aadhaar Number')}:</strong> {worker.aadhaarNumber || t('Not specified')}</p>
                          <p><strong>{t('Verification Status')}:</strong>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              worker.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                              worker.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {t(worker.verificationStatus || 'pending')}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Verification Details */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700">{t('Verification Details')}</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>{t('QR Code Scan')}:</span>
                              <span className="text-green-600">✓ {t('Successful')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('Data Verification')}:</span>
                              <span className="text-green-600">✓ {t('Verified')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('Name Match')}:</span>
                              <span className="text-green-600">✓ {t('Matched')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('Number Match')}:</span>
                              <span className="text-green-600">✓ {t('Matched')}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            // Re-upload functionality
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleAadhaarUpload(e);
                            input.click();
                          }}
                          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          {t('Re-upload Aadhaar Card')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Upload Section */
                    <div className="text-center space-y-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {t('Upload Your Aadhaar Card')}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {t('Please upload a clear image of your Aadhaar card. We will scan the QR code for verification.')}
                        </p>

                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <h5 className="font-medium text-blue-900 mb-2">{t('Important Instructions')}:</h5>
                          <ul className="text-sm text-blue-800 text-left space-y-1">
                            <li>• {t('Ensure QR code is clearly visible')}</li>
                            <li>• {t('Image should be well-lit and not blurry')}</li>
                            <li>• {t('Supported formats: JPG, PNG, PDF')}</li>
                            <li>• {t('Maximum file size: 5MB')}</li>
                          </ul>
                        </div>

                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*,.pdf';
                            input.onchange = (e) => handleAadhaarUpload(e);
                            input.click();
                          }}
                          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Upload className="mr-2" size={20} />
                          {t('Choose Aadhaar Card File')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'certificates' && worker.workerType === 'skilled' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <CertificateUpload
                  userId={worker.id}
                  certificates={worker.certifications || []}
                  onUpdate={(certificates) => {
                    const updatedWorker = { ...worker, certifications: certificates };
                    onUpdateWorker(updatedWorker);
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'portfolio' && worker.workerType === 'skilled' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PortfolioManager
                  userId={worker.id}
                  portfolioItems={worker.portfolio || []}
                  onUpdate={(portfolioItems) => {
                    const updatedWorker = { ...worker, portfolio: portfolioItems };
                    onUpdateWorker(updatedWorker);
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <CoursesManager
                  userId={worker.id}
                  userName={worker.name}
                  onCertificateEarned={(certificate) => {
                    // Add the course certificate to the worker's certifications
                    const updatedCertifications = [...(worker.certifications || []), certificate];
                    const updatedWorker = { ...worker, certifications: updatedCertifications };
                    onUpdateWorker(updatedWorker);
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Profile Picture</h3>
            <div className="mb-4">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleImageSave}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Photo
              </button>
              <button
                onClick={() => {
                  setShowImageEditor(false);
                  setSelectedImage(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
