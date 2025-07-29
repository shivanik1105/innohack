import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, CheckCircle, Star, Award, 
  Briefcase, MapPin, Calendar, User, Phone,
  Shield, Badge, Wrench, Zap, Paintbrush, Hammer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VoiceButton from './VoiceButton';

interface BlueCollarRegistrationProps {
  phoneNumber: string;
  onComplete: (workerData: any) => void;
}

interface FormData {
  name: string;
  age: string;
  pinCode: string;
  photo: File | null;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  email: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  skills: string[];
  experienceYears: string;
  bio: string;
  certificates: File[];
  portfolioItems: Array<{
    title: string;
    description: string;
    image: File | null;
    location: string;
    completedDate: string;
  }>;
}

const skillOptions = [
  { id: 'plumber', name: 'Plumber', icon: <Wrench className="w-5 h-5" />, color: 'blue' },
  { id: 'electrician', name: 'Electrician', icon: <Zap className="w-5 h-5" />, color: 'yellow' },
  { id: 'painter', name: 'Painter', icon: <Paintbrush className="w-5 h-5" />, color: 'green' },
  { id: 'carpenter', name: 'Carpenter', icon: <Hammer className="w-5 h-5" />, color: 'orange' },
  { id: 'welder', name: 'Welder', icon: <Shield className="w-5 h-5" />, color: 'red' },
  { id: 'mason', name: 'Mason', icon: <Badge className="w-5 h-5" />, color: 'gray' }
];

export default function BlueCollarRegistration({ phoneNumber, onComplete }: BlueCollarRegistrationProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    pinCode: '',
    photo: null,
    gender: 'prefer-not-to-say',
    email: '',
    dateOfBirth: '',
    aadhaarNumber: '',
    skills: [],
    experienceYears: '',
    bio: '',
    certificates: [],
    portfolioItems: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkillToggle = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleCertificateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, ...files]
    }));
  };

  const addPortfolioItem = () => {
    setFormData(prev => ({
      ...prev,
      portfolioItems: [...prev.portfolioItems, {
        title: '',
        description: '',
        image: null,
        location: '',
        completedDate: ''
      }]
    }));
  };

  const updatePortfolioItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create worker data with blue-collar specific fields
      const workerData = {
        phoneNumber,
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        email: formData.email,
        aadhaarNumber: formData.aadhaarNumber,
        age: new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear(),
        pinCode: formData.pinCode,
        photo: formData.photo,
        workerType: 'skilled',
        skills: formData.skills,
        experienceYears: parseInt(formData.experienceYears),
        bio: formData.bio,
        certificates: formData.certificates,
        portfolioItems: formData.portfolioItems,
        verificationLevel: 'basic',
        rating: 0,
        totalJobs: 0,
        verificationStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save to backend
      const response = await fetch('/api/register-worker/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workerData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Worker registered successfully:', result);
        onComplete(workerData);
      } else {
        console.error('Registration failed:', await response.text());
        // Still complete registration for demo purposes
        onComplete(workerData);
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Still complete registration for demo purposes
      onComplete(workerData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Personal Information
              </h2>
              <p className="text-gray-600">Let's start with your basic details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
                <VoiceButton
                  onVoiceInput={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Say your name"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 18 years ago
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="prefer-not-to-say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhaar Number *
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012"
                    maxLength={12}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="110001"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handlePhotoCapture}
                    className="hidden"
                    id="photo-input"
                  />
                  <label
                    htmlFor="photo-input"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Take Photo
                  </label>
                  {formData.photo && (
                    <span className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" /> Photo captured
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                disabled={!formData.name || !formData.dateOfBirth || !formData.email || !formData.aadhaarNumber || !formData.pinCode || !formData.photo}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next: Skills & Experience
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Briefcase className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Skills & Experience
              </h2>
              <p className="text-gray-600">Select your professional skills</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Your Skills (Choose multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {skillOptions.map((skill) => (
                  <motion.button
                    key={skill.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSkillToggle(skill.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.skills.includes(skill.id)
                        ? `border-${skill.color}-500 bg-${skill.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`text-${skill.color}-600`}>
                        {skill.icon}
                      </div>
                      <span className="font-medium">{skill.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="5"
                min="0"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio / About Yourself
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Tell employers about your experience and expertise..."
              />
              <VoiceButton 
                onVoiceInput={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Describe your experience"
                className="mt-2"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={formData.skills.length === 0 || !formData.experienceYears}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold disabled:bg-gray-300"
              >
                Next: Certificates
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Certificates & Verification
              </h2>
              <p className="text-gray-600">Upload your skill certificates</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Upload Certificates (Optional but Recommended)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleCertificateUpload}
                  className="hidden"
                  id="certificate-input"
                />
                <label
                  htmlFor="certificate-input"
                  className="cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Upload Government Certificates, Training Badges, or Job References
                  </p>
                  <span className="bg-green-600 text-white px-4 py-2 rounded-lg inline-block">
                    Choose Files
                  </span>
                </label>
              </div>
              
              {formData.certificates.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Certificates ({formData.certificates.length})
                  </p>
                  <div className="space-y-2">
                    {formData.certificates.map((cert, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>{cert.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                🏆 Verification Benefits
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Get "Verified Worker" badge</li>
                <li>• Access to premium jobs</li>
                <li>• Higher pay rates</li>
                <li>• Increased employer trust</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold"
              >
                Next: Portfolio
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Work Portfolio
              </h2>
              <p className="text-gray-600">Showcase your best work (Optional)</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Portfolio Items
                </label>
                <button
                  onClick={addPortfolioItem}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                >
                  Add Work Sample
                </button>
              </div>

              {formData.portfolioItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No portfolio items yet. Add some to showcase your work!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.portfolioItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Project title"
                          value={item.title}
                          onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                          className="p-2 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Location"
                          value={item.location}
                          onChange={(e) => updatePortfolioItem(index, 'location', e.target.value)}
                          className="p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <textarea
                        placeholder="Describe the work you did..."
                        value={item.description}
                        onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mb-3"
                        rows={2}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updatePortfolioItem(index, 'image', file);
                        }}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-yellow-600 text-white rounded-lg font-semibold disabled:bg-gray-300"
              >
                {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full mx-1 ${
                step <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            🎯 Build your professional profile and get verified!
          </p>
        </div>
      </div>
    </div>
  );
}
