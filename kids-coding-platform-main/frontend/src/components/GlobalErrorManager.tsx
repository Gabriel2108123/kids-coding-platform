import React from 'react';
import { useGlobalError } from '../context/GlobalErrorContext';
import ErrorDisplay from './common/ErrorDisplay';

/**
 * GlobalErrorManager - Manages the display of global errors
 * This component should be placed at the root level of your app
 * to handle all error displays in a centralized manner.
 */
export const GlobalErrorManager: React.FC = () => {
  const { currentError, clearCurrentError } = useGlobalError();

  return (
    <ErrorDisplay
      error={currentError?.message || null}
      onClose={clearCurrentError}
      variant={currentError?.variant || 'error'}
      position="top-right"
      autoClose={true}
      autoCloseDelay={currentError?.variant === 'error' ? 7000 : 5000} // Errors stay longer
    />
  );
};

export default GlobalErrorManager;
