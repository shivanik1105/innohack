import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Worker, Job } from '../types/worker';
import LocationSelector from './LocationSelector';
import { useLanguage } from '../hooks/useLanguage';
import { TranslationKey } from '/Users/janhvi/innohack1/innohack/src/utils/translations.ts';
import { useTranslation } from 'react-i18next';

interface WorkerDashboardProps {
  worker: Worker;
  onUpdateWorker: (worker: Worker) => void;
  initialLanguage?: string; 
  language: 'en' | 'hi' | 'mr';
}

const validJobTypes = ['cleaner', 'loader', 'driver'] as const;
type JobType = typeof validJobTypes[number];

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'सफाई का काम / Cleaning Work',
    description: 'ऑफिस की सफाई / Office cleaning',
    payPerDay: 800,
    location: 'Connaught Place',
    pinCode: '110001',
    contactNumber: '9876543210',
    contractorName: 'राम कुमार / Ram Kumar',
    jobType: 'cleaner',
    requiredWorkers: 2,
    duration: '1 दिन / 1 day',
    postedAt: new Date(),
    status: 'open'
  },
  {
    id: '2',
    title: 'लोडिंग का काम / Loading Work',
    description: 'सामान लादना / Load goods',
    payPerDay: 1000,
    location: 'Karol Bagh',
    pinCode: '110005',
    contactNumber: '9876543211',
    contractorName: 'श्याम सिंह / Shyam Singh',
    jobType: 'loader',
    requiredWorkers: 5,
    duration: '2 दिन / 2 days',
    postedAt: new Date(),
    status: 'open'
  },
  {
    id: '3',
    title: 'ड्राइवर का काम / Driver Work',
    description: 'ट्रक चलाना / Drive truck',
    payPerDay: 1200,
    location: 'Nehru Place',
    pinCode: '110019',
    contactNumber: '9876543212',
    contractorName: 'मोहन लाल / Mohan Lal',
    jobType: 'driver',
    requiredWorkers: 1,
    duration: '3 दिन / 3 days',
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
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<string>('en');
  const [activeTab, setActiveTab] = useState<'jobs' | 'profile' | 'payments' | 'aadhaar'>('jobs');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [locationFilter, setLocationFilter] = useState<'nearby' | 'all'>('nearby');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCount] = useState(3);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedWorker, setEditedWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const storedLang = localStorage.getItem('appLanguage');
    if (storedLang === 'hi' || storedLang === 'mr' || storedLang === 'en') {
      i18n.changeLanguage(storedLang);
      setLanguage(storedLang);
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

  const translateJobType = (type: string) => {
    if (validJobTypes.includes(type as JobType)) {
      return t(type as TranslationKey);
    }
    return type;
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

  const filteredJobs = mockJobs.filter((job) => {
    const matchesJobType = selectedJobType === 'all' || job.jobType === selectedJobType;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      (locationFilter === 'nearby'
        ? matchesJobType &&
          worker?.pinCode &&
          job?.pinCode &&
          job.pinCode.startsWith(worker.pinCode.slice(0, 3))
        : matchesJobType) && matchesSearch
    );
  });

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleLocationChoice = (choice: 'nearby' | 'all') => {
    setLocationFilter(choice);
    setShowLocationSelector(false);
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
                    {worker.jobTypes.map(type => translateJobType(type)).join(', ')}
                  </p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (['jobs', 'profile', 'payments', 'aadhaar'].includes(item.label)) {
                        setActiveTab(item.label as 'jobs' | 'profile' | 'payments' | 'aadhaar');
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
                    <span className="font-medium">{t(`sidebar.${item.label}`)}</span>
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
            {(['jobs', 'profile', 'payments', 'aadhaar'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedJobType('all')}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        selectedJobType === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {t('AllJobs')}
                    </button>
                    {validJobTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedJobType(type)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          selectedJobType === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        {translateJobType(type)}
                      </button>
                    ))}
                  </div>
                </div>

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

                {filteredJobs.length === 0 ? (
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
                              ₹{job.payPerDay}/day
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-4 h-4 mr-1.5 text-indigo-600" /> 
                              <span className="truncate max-w-[120px]">{job.location}</span>
                            </div>
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
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <div className="text-xs text-gray-500 font-medium mb-1">{t('postedBy')}</div>
                                    <div className="font-medium text-gray-800">{job.contractorName}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 font-medium mb-1">{t('workersNeeded')}</div>
                                    <div className="font-bold text-indigo-600">{job.requiredWorkers}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 font-medium mb-1">{t('phone')}</div>
                                    <div className="font-medium text-gray-800">{job.contactNumber}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 font-medium mb-1">PIN Code</div>
                                    <div className="font-medium text-gray-800">{job.pinCode}</div>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleCall(job.contactNumber)}
                                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center shadow-md hover:shadow-lg font-medium"
                                >
                                  <Phone className="w-4 h-4 mr-2" /> 
                                  <span>{t('callNow')}</span>
                                </button>
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <User className="mr-2 text-indigo-600" size={20} /> 
                      {t('personalInfo')}
                    </h3>
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
                          <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            {t('uploadNewPicture')}
                          </button>
                          <button className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
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
                        {t('dateOfBirth')}
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
                            t('notSpecified')}
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <label className="text-xs text-gray-500 block mb-1">
                            {t('workerRegistration.personalInfo.label')}
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
                              <option value="male">{t('workerRegistration.personalInfo.male')}</option>
                              <option value="female">{t('workerRegistration.personalInfo.female')}</option>
                          </select>
                          ) : (
                            <div className="font-medium text-gray-800">
                              {worker.gender ? 
                                t(`workerRegistration.personalInfo.${worker.gender}`) : 
                                t('workerRegistration.personalInfo.selectPlaceholder')}
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <label className="text-xs text-gray-500 block mb-1">
                            {t('email')}
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
                              {worker.email || t('notSpecified')}
                            </div>
                          )}
                        </div>
                    {/* Account Info Section */}
                    <div className="md:col-span-2 mt-4">
                      <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Account Info</h4>
                    </div>

                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="text-xs text-gray-500 block mb-1">{t('aadhaarNumber')}</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="aadhaarNumber"
                          value={editedWorker.aadhaarNumber || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <div className="font-medium text-gray-800">{worker.aadhaarNumber || 'Not specified'}</div>
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
                    {worker.jobTypes.map((type) => (
                      <span
                        key={type}
                        className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-sm"
                      >
                        {translateJobType(type)}
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
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-12 h-12 text-indigo-600 opacity-80" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{t('paymentRecords')}</h3>
                <p className="text-gray-500 mb-6">{t('noPaymentRecords')}</p>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 max-w-md mx-auto border border-gray-200">
                  {t('yourWorkPaymentsWillAppearHere')}
                </div>
              </motion.div>
            )}

            {activeTab === 'aadhaar' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('aadhaarCardTitle') || 'Your Aadhaar Card'}</h3>
                
                {worker.aadhaarCardImage ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={worker.aadhaarCardImage} 
                      alt="Aadhaar Card"
                      className="w-full max-w-md rounded-lg shadow-md border"
                    />
                    <p className="text-gray-500 text-sm mt-2">{t('aadhaarCardUploaded') || 'This is the Aadhaar card you uploaded during registration.'}</p>
                  </div>
                ) : (
                  <div className="text-gray-600">{t('aadhaarNotUploaded') || 'No Aadhaar card uploaded.'}</div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}