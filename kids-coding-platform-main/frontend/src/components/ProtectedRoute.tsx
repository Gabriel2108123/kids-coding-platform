import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFamilyAuth } from '../context/FamilyAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'parent' | 'child';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType
}) => {
  const { userType, currentUser, isAuthenticated, isLoading } = useFamilyAuth();
  const location = useLocation();

  // Debug logging
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('ProtectedRoute state:', {
      userType,
      isAuthenticated,
      isLoading,
      currentUser: !!currentUser,
      requiredUserType,
      location: location.pathname
    });
  }, [userType, isAuthenticated, isLoading, currentUser, requiredUserType, location.pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    // eslint-disable-next-line no-console
    console.log('ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !currentUser) {
    // eslint-disable-next-line no-console
    console.log('ProtectedRoute: Redirecting to login - not authenticated or no current user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific user type is required, check it
  if (requiredUserType && userType !== requiredUserType) {
    // eslint-disable-next-line no-console
    console.log('ProtectedRoute: User type mismatch - redirecting');
    // If parent tries to access child routes, redirect to parent dashboard
    if (userType === 'parent' && requiredUserType === 'child') {
      return <Navigate to="/parent-dashboard" replace />;
    }

    // If child tries to access parent routes, redirect to child dashboard
    if (userType === 'child' && requiredUserType === 'parent') {
      return <Navigate to="/dashboard" replace />;
    }

    // Default fallback
    return <Navigate to="/login" replace />;
  }

  // eslint-disable-next-line no-console
  console.log('ProtectedRoute: Rendering protected content');

  // For child users, check if they have basic safety settings
  if (userType === 'child') {
    const child = currentUser as any; // ChildProfile

    // Check if parental consent is given (backend uses 'parentalConsent' or 'consentGiven')
    if (!child.coppa?.parentalConsent && !child.hasParentalConsent && !child.coppa?.consentGiven) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
            <div className="text-4xl mb-4">�</div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Parental Consent Required
            </h2>
            <p className="text-gray-600 mb-6">
              Your parent needs to complete your account setup before you can start coding.
              Please ask your parent to log in and finish setting up your profile!
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
