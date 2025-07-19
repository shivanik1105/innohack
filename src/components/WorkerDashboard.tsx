import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Star, 
  Calendar, 
  DollarSign, 
  User, 
  Camera,
  Upload,
  Award,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Worker, Job } from '../types/worker';
import LocationSelector from './LocationSelector';
import { useLanguage } from '../hooks/useLanguage';

interface WorkerDashboardProps {
  worker: Worker;
  onUpdateWorker: (worker: Worker) => void;
}

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
  }
];

export default function WorkerDashboard({ worker, onUpdateWorker }: WorkerDashboardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'jobs' | 'profile' | 'payments'>('jobs');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [locationFilter, setLocationFilter] = useState<'nearby' | 'all'>('nearby');
  const [showCertUpload, setShowCertUpload] = useState(false);

  const toggleAvailability = () => {
    onUpdateWorker({
      ...worker,
      isAvailableToday: !worker.isAvailableToday
    });
  };

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleLocationChoice = (choice: 'nearby' | 'all') => {
    setLocationFilter(choice);
    setShowLocationSelector(false);
  };

  const filteredJobs = mockJobs.filter(job => {
    const matchesJobType = worker.jobTypes.includes(job.jobType);
    
    if (locationFilter === 'nearby') {
      // Show jobs within same pin code area (first 3 digits)
      return matchesJobType && job.pinCode.startsWith(worker.pinCode.slice(0, 3));
    } else {
      // Show all jobs in the city/state
      return matchesJobType;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            {worker.photo ? (
              <img src={worker.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{worker.name}</h1>
            <p className="opacity-90">{worker.phoneNumber}</p>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{worker.pinCode}</span>
              {worker.verificationStatus === 'verified' && (
                <div className="bg-green-500 px-2 py-1 rounded-full text-xs flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  {t('verified')}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={toggleAvailability}
            className="flex flex-col items-center space-y-1"
          >
            {worker.isAvailableToday ? (
              <ToggleRight className="w-8 h-8 text-green-300" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-gray-300" />
            )}
            <span className="text-xs">
              {worker.isAvailableToday ? t('available') : t('busy')}
            </span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{worker.totalJobs}</div>
          <div className="text-sm text-gray-600">{t('totalJobs')}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
          <div className="flex items-center justify-center mb-1">
            <Star className="w-5 h-5 text-yellow-500 mr-1" />
            <span className="text-2xl font-bold text-yellow-600">{worker.rating.toFixed(1)}</span>
          </div>
          <div className="text-sm text-gray-600">{t('rating')}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
          <div className="text-2xl font-bold text-green-600">₹{(worker.totalJobs * 850).toLocaleString()}</div>
          <div className="text-sm text-gray-600">{t('totalEarned')}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white mx-4 rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-4 px-6 font-semibold transition-colors ${
            activeTab === 'jobs' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('jobs')}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-4 px-6 font-semibold transition-colors ${
            activeTab === 'profile' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('profile')}
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-4 px-6 font-semibold transition-colors ${
            activeTab === 'payments' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('payments')}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {t('jobsForYou')}
              </h2>
              <button
                onClick={() => setShowLocationSelector(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {locationFilter === 'nearby' ? t('nearbyJobs') : t('allJobs')}
              </button>
            </div>
            
            {showLocationSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <LocationSelector onLocationChoice={handleLocationChoice} />
                  <button
                    onClick={() => setShowLocationSelector(false)}
                    className="w-full mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('noJobsFound')}
                </h3>
                <p className="text-gray-600">
                  {t('noJobsAvailable')}
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{job.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {job.duration}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{job.payPerDay}
                      </div>
                      <div className="text-sm text-gray-500">{t('perDay')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <strong>{job.contractorName}</strong> {t('postedBy')}
                    </div>
                    <button
                      onClick={() => handleCall(job.contactNumber)}
                      className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {t('call')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('personalInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('name')}</label>
                  <div className="text-lg font-semibold text-gray-900">{worker.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('age')}</label>
                  <div className="text-lg font-semibold text-gray-900">{worker.age}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('phone')}</label>
                  <div className="text-lg font-semibold text-gray-900">{worker.phoneNumber}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('pinCode')}</label>
                  <div className="text-lg font-semibold text-gray-900">{worker.pinCode}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('jobTypes')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {worker.jobTypes.map((jobType) => (
                  <span
                    key={jobType}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {t(jobType as any)}
                  </span>
                ))}
              </div>
            </div>

            {worker.workerType === 'skilled' && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {t('certifications')}
                  </h3>
                  <button
                    onClick={() => setShowCertUpload(!showCertUpload)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('upload')}
                  </button>
                </div>
                
                {showCertUpload && (
                  <div className="bg-blue-50 p-4 rounded-xl mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t('uploadCert')}
                    </h4>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      Upload government certificates, NGO training, or work proof
                    </div>
                  </div>
                )}
                
                <div className="text-center text-gray-500 py-8">
                  {t('noCertificates')}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('paymentLog')}
            </h2>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('paymentRecords')}
              </h3>
              <p className="text-gray-600 mb-4">
                Your work payment records will appear here
              </p>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600">
                  {t('noPaymentRecords')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}