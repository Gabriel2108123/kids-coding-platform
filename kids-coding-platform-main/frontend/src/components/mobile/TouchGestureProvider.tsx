import React, { useEffect, useState } from 'react';

interface TouchGestureProviderProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
}

interface TouchEvent {
  touches: Touch[];
  changedTouches: Touch[];
  timeStamp: number;
}

interface Touch {
  clientX: number;
  clientY: number;
  identifier: number;
}

const TouchGestureProvider: React.FC<TouchGestureProviderProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number>(0);

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    if (e.touches.length === 1) {
      // Single touch - potential swipe or tap
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      });
    } else if (e.touches.length === 2) {
      // Two finger touch - potential pinch
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance > 0) {
      // Handle pinch gesture
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialPinchDistance;
      onPinch?.(scale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || e.touches.length > 0) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Minimum distance and maximum time for swipe detection
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;
    
    if (deltaTime < maxSwipeTime) {
      if (absDeltaX < 10 && absDeltaY < 10) {
        // This is a tap
        const now = Date.now();
        if (now - lastTap < 300) {
          // Double tap
          onDoubleTap?.();
        }
        setLastTap(now);
      } else if (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) {
        // This is a swipe
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
    }
    
    setTouchStart(null);
    setInitialPinchDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      {children}
    </div>
  );
};

// Mobile-optimized component wrapper
interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({ children, className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|blackberry|kindle|mobile|palm|phone|playbook|tablet/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkMobile();
    checkOrientation();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const mobileStyles = isMobile ? {
    fontSize: '16px', // Prevent zoom on iOS
    userSelect: 'none' as const,
    touchAction: 'manipulation' as const,
    WebkitTapHighlightColor: 'transparent'
  } : {};

  return (
    <div 
      className={`${className} ${isMobile ? 'mobile-optimized' : ''} ${orientation}`}
      style={mobileStyles}
    >
      {children}
    </div>
  );
};

// Touch-friendly button component
interface TouchButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'medium'
}) => {
  const baseClasses = 'touch-button font-semibold rounded-lg transition-all duration-200 select-none';
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-lg'
  };

  const sizeClasses = {
    small: 'px-3 py-2 text-sm min-h-[40px]',
    medium: 'px-6 py-3 text-base min-h-[48px]',
    large: 'px-8 py-4 text-lg min-h-[56px]'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </button>
  );
};

// Mobile-friendly modal
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg mx-4 rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <TouchButton
              onClick={onClose}
              variant="secondary"
              size="small"
              className="w-8 h-8 p-0 flex items-center justify-center"
            >
              ✕
            </TouchButton>
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Swipeable card component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}) => {
  return (
    <TouchGestureProvider
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
    >
      <div className={`swipeable-card ${className}`}>
        {children}
      </div>
    </TouchGestureProvider>
  );
};

export default TouchGestureProvider;
