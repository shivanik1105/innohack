import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Camera, FileText, CheckCircle, AlertCircle, 
  Award, Shield, Building, Users, Eye, Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Certificate {
  id: string;
  title: string;
  type: 'government' | 'ngo' | 'private' | 'reference';
  imageUrl: string;
  isVerified: boolean;
  verificationData: any;
  uploadedAt: string;
  verifiedAt?: string;
}

interface CertificateUploadProps {
  userId: string;
  certificates: Certificate[];
  onUpdate: (certificates: Certificate[]) => void;
}

const certificateTypes = [
  {
    id: 'government',
    name: 'Government Certificate',
    icon: Shield,
    color: 'blue',
    description: 'ITI, Skill Development certificates, etc.',
    examples: ['ITI Certificate', 'NSDC Certificate', 'Government Training']
  },
  {
    id: 'ngo',
    name: 'NGO Training',
    icon: Users,
    color: 'green',
    description: 'Training from NGOs and social organizations',
    examples: ['NGO Skill Training', 'Community Program', 'Social Initiative']
  },
  {
    id: 'private',
    name: 'Private Institution',
    icon: Building,
    color: 'purple',
    description: 'Private training institutes and companies',
    examples: ['Company Training', 'Private Institute', 'Corporate Program']
  },
  {
    id: 'reference',
    name: 'Job Reference',
    icon: Award,
    color: 'orange',
    description: 'Previous work references and recommendations',
    examples: ['Work Certificate', 'Employer Reference', 'Project Completion']
  }
];

export default function CertificateUpload({
  userId,
  certificates,
  onUpdate
}: CertificateUploadProps) {
  const { t } = useTranslation();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [certificateTitle, setCertificateTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Function to fetch certificates from database
  const fetchCertificatesFromDB = async () => {
    try {
      const API_BASE_URL = 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/certificates/`);
      if (response.ok) {
        const data = await response.json();
        console.log('Certificates response:', data); // Debug log
        if (data.status === 'success') {
          const dbCertificates = data.certificates.map((cert: any) => ({
            id: cert.id.toString(),
            title: cert.title,
            type: cert.type,
            imageUrl: cert.imageUrl,
            isVerified: cert.isVerified,
            verificationData: cert.verificationData,
            uploadedAt: cert.uploadedAt,
            verifiedAt: cert.verifiedAt
          }));
          console.log('Mapped certificates:', dbCertificates); // Debug log
          onUpdate(dbCertificates);
        }
      } else {
        console.error('Failed to fetch certificates:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    }
  };

  // Fetch certificates on component mount
  React.useEffect(() => {
    fetchCertificatesFromDB();
  }, [userId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType || !certificateTitle) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Start upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare form data for real API call
      const formData = new FormData();
      formData.append('certificate_image', selectedFile);
      formData.append('title', certificateTitle);
      formData.append('type', selectedType);

      // Call certificate verification API (with built-in name verification)
      const API_BASE_URL = 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/upload-certificate/`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Certificate upload result:', result); // Debug log
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.status === 'success' || result.status === 'error') {
        const newCertificate: Certificate = {
          id: result.certificate?.id || Date.now().toString(),
          title: certificateTitle,
          type: selectedType as any,
          imageUrl: result.certificate?.imageUrl || URL.createObjectURL(selectedFile),
          isVerified: result.verification_details?.is_verified || false,
          verificationData: {
            extractedText: result.verification_details?.name_verification?.extracted_name || '',
            confidence: result.verification_details?.ocr_confidence || 0,
            verificationStatus: result.verification_details?.verification_status || 'failed',
            nameVerification: result.verification_details?.name_verification || {},
            ocrProcessedAt: new Date().toISOString()
          },
          uploadedAt: new Date().toISOString(),
          verifiedAt: result.verification_details?.is_verified ? new Date().toISOString() : undefined
        };

        // Refresh certificates from database instead of local state
        await fetchCertificatesFromDB();

        // Show user-friendly verification result
        if (result.verification_details?.verification_status === 'name_mismatch') {
          alert('❌ Certificate verification failed: The name on your certificate does not match your profile name. Please ensure you are uploading your own certificate.');
        } else if (result.verification_details?.is_verified) {
          alert('✅ Certificate uploaded and verified successfully!');
        } else {
          alert('⚠️ Certificate uploaded successfully. It will be reviewed and verified shortly.');
        }

        // Reset form
        setTimeout(() => {
          setShowUploadForm(false);
          setSelectedFile(null);
          setCertificateTitle('');
          setSelectedType('');
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload failed:', error);
      alert(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (certificateId: string) => {
    const updatedCertificates = certificates.filter(cert => cert.id !== certificateId);
    onUpdate(updatedCertificates);
  };

  const getTypeConfig = (type: string) => {
    return certificateTypes.find(t => t.id === type) || certificateTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certificates & Verification</h2>
          <p className="text-gray-600">Upload your certificates to get verified and access premium jobs</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUploadForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Certificate</span>
        </motion.button>
      </div>

      {/* Upload Form */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload New Certificate
            </h3>

            {/* Simplified Certificate Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Certificate Type *
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select certificate type</option>
                {certificateTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Certificate Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Title *
              </label>
              <input
                type="text"
                value={certificateTitle}
                onChange={(e) => setCertificateTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter certificate title (e.g., ITI Electrician Certificate)"
              />
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Image *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="certificate-file"
                />
                <label htmlFor="certificate-file" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="text-green-600 font-medium">{selectedFile.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600">Click to upload certificate image</p>
                      <p className="text-sm text-gray-500">JPG, PNG formats supported</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Processing certificate...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-green-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Using OCR to verify certificate details...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUploadForm(false)}
                disabled={isUploading}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedType || !certificateTitle || isUploading}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
              >
                {isUploading ? 'Processing...' : 'Upload & Verify'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-600 mb-4">
            Upload your certificates to get verified and access premium jobs
          </p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Upload Your First Certificate
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((certificate) => {
            const typeConfig = getTypeConfig(certificate.type);
            const IconComponent = typeConfig.icon;
            
            return (
              <motion.div
                key={certificate.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-${typeConfig.color}-100 rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 text-${typeConfig.color}-600`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{certificate.title}</h3>
                        {certificate.isVerified ? (
                          <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>Pending</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{typeConfig.name}</p>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Uploaded: {new Date(certificate.uploadedAt).toLocaleDateString()}</p>
                        {certificate.verifiedAt && (
                          <p>Verified: {new Date(certificate.verifiedAt).toLocaleDateString()}</p>
                        )}
                        {/* Show simple verification status without technical details */}
                        {certificate.verificationData?.verificationStatus === 'name_mismatch' && (
                          <p className="text-red-600">⚠️ Verification failed - Name mismatch</p>
                        )}
                        {certificate.verificationData?.verificationStatus === 'verified' && (
                          <p className="text-green-600">✅ Automatically verified</p>
                        )}
                        {certificate.verificationData?.verificationStatus === 'needs_review' && (
                          <p className="text-yellow-600">⏳ Under review</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(certificate.imageUrl, '_blank')}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View Certificate"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(certificate.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Verification Benefits */}
      {certificates.length > 0 && (
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-3">🎯 Your Verification Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{certificates.length}</div>
              <div className="text-sm text-green-800">Certificates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {certificates.filter(c => c.isVerified).length}
              </div>
              <div className="text-sm text-green-800">Verified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {new Set(certificates.map(c => c.type)).size}
              </div>
              <div className="text-sm text-green-800">Types</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {certificates.filter(c => c.isVerified).length >= 2 ? '✓' : '○'}
              </div>
              <div className="text-sm text-green-800">Premium Status</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
