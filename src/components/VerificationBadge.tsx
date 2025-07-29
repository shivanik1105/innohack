import React from 'react';
import { Shield, CheckCircle, Star, Crown, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerificationBadgeProps {
  verificationStatus: 'pending' | 'verified' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function VerificationBadge({ 
  verificationStatus, 
  size = 'md', 
  showText = true,
  className = '' 
}: VerificationBadgeProps) {
  
  const getBadgeConfig = () => {
    switch (verificationStatus) {
      case 'premium':
        return {
          icon: Crown,
          color: 'text-yellow-600',
          bgColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
          borderColor: 'border-yellow-500',
          text: 'Premium Verified',
          description: 'Top-rated professional with extensive verification'
        };
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-gradient-to-r from-green-400 to-green-600',
          borderColor: 'border-green-500',
          text: 'Verified Worker',
          description: 'Identity and skills verified'
        };
      case 'pending':
      default:
        return {
          icon: Shield,
          color: 'text-gray-500',
          bgColor: 'bg-gradient-to-r from-gray-400 to-gray-500',
          borderColor: 'border-gray-400',
          text: 'Verification Pending',
          description: 'Verification in progress'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-6 h-6',
          icon: 'w-4 h-4',
          text: 'text-xs',
          badge: 'px-2 py-1'
        };
      case 'lg':
        return {
          container: 'w-12 h-12',
          icon: 'w-8 h-8',
          text: 'text-base',
          badge: 'px-4 py-2'
        };
      case 'md':
      default:
        return {
          container: 'w-8 h-8',
          icon: 'w-6 h-6',
          text: 'text-sm',
          badge: 'px-3 py-1.5'
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses = getSizeClasses();
  const IconComponent = config.icon;

  if (!showText) {
    // Icon only badge
    return (
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`
          ${sizeClasses.container} 
          ${config.bgColor} 
          rounded-full 
          flex items-center justify-center 
          shadow-lg 
          border-2 
          ${config.borderColor}
          ${className}
        `}
        title={config.description}
      >
        <IconComponent className={`${sizeClasses.icon} text-white`} />
      </motion.div>
    );
  }

  // Badge with text
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        inline-flex items-center 
        ${sizeClasses.badge} 
        ${config.bgColor} 
        text-white 
        rounded-full 
        shadow-lg 
        border-2 
        ${config.borderColor}
        ${sizeClasses.text}
        font-semibold
        ${className}
      `}
      title={config.description}
    >
      <IconComponent className={`${sizeClasses.icon} mr-1.5`} />
      <span>{config.text}</span>
    </motion.div>
  );
}

// Additional verification components

export function VerificationCard({ 
  verificationStatus, 
  certificateCount = 0, 
  portfolioCount = 0 
}: {
  verificationStatus: 'pending' | 'verified' | 'premium';
  certificateCount?: number;
  portfolioCount?: number;
}) {
  const config = getBadgeConfig();
  
  function getBadgeConfig() {
    switch (verificationStatus) {
      case 'premium':
        return {
          icon: Crown,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Premium Verified Professional',
          benefits: [
            'All skills verified with certificates',
            'Extensive work portfolio',
            'Top employer ratings',
            'Priority job matching'
          ]
        };
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Verified Professional',
          benefits: [
            'Identity verified',
            'Skills certified',
            'Background checked',
            'Trusted by employers'
          ]
        };
      case 'pending':
      default:
        return {
          icon: Shield,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Verification in Progress',
          benefits: [
            'Upload certificates to verify skills',
            'Add work portfolio',
            'Complete profile verification',
            'Get access to premium jobs'
          ]
        };
    }
  }

  const IconComponent = config.icon;

  return (
    <div className={`
      p-6 rounded-xl border-2 
      ${config.bgColor} 
      ${config.borderColor}
    `}>
      <div className="flex items-center mb-4">
        <div className={`
          w-12 h-12 rounded-full 
          ${verificationStatus === 'premium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
            verificationStatus === 'verified' ? 'bg-gradient-to-r from-green-400 to-green-600' :
            'bg-gradient-to-r from-gray-400 to-gray-500'
          }
          flex items-center justify-center mr-4
        `}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`font-bold ${config.color}`}>{config.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <span>{certificateCount} Certificates</span>
            <span>{portfolioCount} Portfolio Items</span>
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {config.benefits.map((benefit, index) => (
          <li key={index} className="flex items-center text-sm text-gray-700">
            <div className={`w-2 h-2 rounded-full ${
              verificationStatus === 'premium' ? 'bg-yellow-500' :
              verificationStatus === 'verified' ? 'bg-green-500' :
              'bg-gray-400'
            } mr-3`} />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillBadge({ 
  skill, 
  isVerified = false 
}: { 
  skill: string; 
  isVerified?: boolean; 
}) {
  return (
    <div className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
      ${isVerified 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-gray-100 text-gray-700 border border-gray-200'
      }
    `}>
      <span>{skill}</span>
      {isVerified && (
        <CheckCircle className="w-4 h-4 ml-1.5 text-green-600" />
      )}
    </div>
  );
}

export function RatingBadge({ 
  rating, 
  totalJobs 
}: { 
  rating: number; 
  totalJobs: number; 
}) {
  const getStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
      <div className="flex items-center mr-2">
        {getStars()}
      </div>
      <span className="text-sm font-semibold text-gray-900">
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-gray-500 ml-1">
        ({totalJobs} jobs)
      </span>
    </div>
  );
}
