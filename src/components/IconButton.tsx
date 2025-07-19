import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  hindiLabel: string;
  onClick: () => void;
  isSelected?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function IconButton({ 
  icon: Icon, 
  label, 
  hindiLabel, 
  onClick, 
  isSelected = false,
  className = '',
  size = 'md'
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        ${isSelected 
          ? 'bg-blue-600 text-white border-2 border-blue-600' 
          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
        }
        rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105
        flex flex-col items-center space-y-2 min-w-[120px]
        ${className}
      `}
    >
      <Icon className={iconSizes[size]} />
      <div className="text-center">
        <div className="font-semibold">{hindiLabel}</div>
        <div className="text-xs opacity-75">{label}</div>
      </div>
    </button>
  );
}