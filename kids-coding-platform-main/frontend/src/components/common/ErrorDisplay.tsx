import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ErrorDisplayProps {
  error: string | null;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
  position = 'top-right',
  variant = 'error'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Animation duration
  }, [onClose]);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setIsExiting(false);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
      setIsExiting(false);
    }
  }, [error, autoClose, autoCloseDelay, handleClose]);

  if (!error || !isVisible) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 shadow-red-100',
          icon: '❌',
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
          buttonColor: 'text-red-600 hover:text-red-800'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 shadow-yellow-100',
          icon: '⚠️',
          iconColor: 'text-yellow-500',
          textColor: 'text-yellow-800',
          buttonColor: 'text-yellow-600 hover:text-yellow-800'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 shadow-blue-100',
          icon: 'ℹ️',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-800',
          buttonColor: 'text-blue-600 hover:text-blue-800'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200 shadow-red-100',
          icon: '❌',
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
          buttonColor: 'text-red-600 hover:text-red-800'
        };
    }
  };

  const variantStyles = getVariantClasses();
  const positionClasses = getPositionClasses();

  const errorBox = (
    <div
      className={`
        fixed z-50 max-w-md w-full mx-4
        ${positionClasses}
        ${isExiting ? 'animate-fadeOutSlide' : 'animate-fadeInSlide'}
      `}
    >
      <div className={`
        ${variantStyles.container}
        border rounded-lg shadow-lg
        backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
      `}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className={`text-lg ${variantStyles.iconColor}`}>
                {variantStyles.icon}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${variantStyles.textColor} mb-1`}>
                {variant === 'error' ? 'Error' : variant === 'warning' ? 'Warning' : 'Information'}
              </h3>
              <p className={`text-sm ${variantStyles.textColor} leading-relaxed`}>
                {error}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleClose}
                className={`
                  ${variantStyles.buttonColor}
                  rounded-md p-1.5 inline-flex items-center justify-center
                  hover:bg-white hover:bg-opacity-20
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                  transition-colors duration-200
                `}
                aria-label="Close error message"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar for Auto-close */}
        {autoClose && (
          <div className="h-1 bg-black bg-opacity-10">
            <div 
              className="h-full bg-current opacity-50 animate-shrinkBar"
              style={{ 
                animationDuration: `${autoCloseDelay}ms`,
                animationTimingFunction: 'linear'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal to avoid z-index issues
  return createPortal(errorBox, document.body);
};

export default ErrorDisplay;
