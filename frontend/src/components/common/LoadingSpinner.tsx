import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  center?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message, 
  center = true 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const content = (
    <div className="flex flex-col items-center space-y-2">
      <div className={`spinner ${sizeClasses[size]}`} />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );

  if (center) {
    return (
      <div className="flex items-center justify-center py-12">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;