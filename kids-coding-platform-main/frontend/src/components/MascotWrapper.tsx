import React from 'react';
import { useLocation } from 'react-router-dom';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import InteractiveMascot from './InteractiveMascot';
import { ChildProfile } from '../types/family';

interface MascotWrapperProps {
  children: React.ReactNode;
  disabled?: boolean; // Option to disable mascot on specific pages
}

const MascotWrapper: React.FC<MascotWrapperProps> = ({ children, disabled = false }) => {
  const { currentUser, userType } = useFamilyAuth();
  const location = useLocation();
  
  // Only show mascot for child users
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;
  
  // Determine context based on current route
  const getPageContext = (pathname: string): string => {
    if (pathname.includes('/learn')) return 'learn';
    if (pathname.includes('/build')) return 'build';
    if (pathname.includes('/quiz')) return 'quiz';
    if (pathname.includes('/games')) return 'games';
    if (pathname.includes('/badges')) return 'badges';
    if (pathname === '/' || pathname.includes('/home')) return 'home';
    return 'general';
  };

  const shouldShowMascot = !disabled && childUser && location.pathname !== '/login' && location.pathname !== '/register';

  return (
    <>
      {children}
      {shouldShowMascot && (
        <InteractiveMascot 
          context={getPageContext(location.pathname)}
          position="bottom-right"
          autoGreeting={location.pathname === '/' || location.pathname.includes('/home')}
        />
      )}
    </>
  );
};

export default MascotWrapper;
