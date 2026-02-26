import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

// ==========================================
// TYPES
// ==========================================

export interface ErrorState {
  id: string;
  message: string;
  variant: 'error' | 'warning' | 'info';
  timestamp: number;
  source?: string; // Which component/service reported the error
}

export interface GlobalErrorState {
  errors: ErrorState[];
  currentError: ErrorState | null;
}

// ==========================================
// ACTIONS
// ==========================================

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<ErrorState, 'id' | 'timestamp'> }
  | { type: 'REMOVE_ERROR'; payload: string } // Error ID
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'SET_CURRENT_ERROR'; payload: ErrorState | null };

// ==========================================
// REDUCER
// ==========================================

const initialState: GlobalErrorState = {
  errors: [],
  currentError: null,
};

function errorReducer(state: GlobalErrorState, action: ErrorAction): GlobalErrorState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const newError: ErrorState = {
        ...action.payload,
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      
      // Prevent duplicate errors
      const isDuplicate = state.errors.some(
        error => error.message === newError.message && error.variant === newError.variant
      );
      
      if (isDuplicate) {
        return state;
      }
      
      return {
        ...state,
        errors: [...state.errors, newError],
        currentError: newError, // Show the latest error
      };
    }
    
    case 'REMOVE_ERROR': {
      const filteredErrors = state.errors.filter(error => error.id !== action.payload);
      return {
        ...state,
        errors: filteredErrors,
        currentError: state.currentError?.id === action.payload 
          ? (filteredErrors.length > 0 ? filteredErrors[filteredErrors.length - 1] : null)
          : state.currentError,
      };
    }
    
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: [],
        currentError: null,
      };
    
    case 'SET_CURRENT_ERROR':
      return {
        ...state,
        currentError: action.payload,
      };
    
    default:
      return state;
  }
}

// ==========================================
// CONTEXT
// ==========================================

interface GlobalErrorContextType extends GlobalErrorState {
  // Error management methods
  showError: (message: string, source?: string, variant?: 'error' | 'warning' | 'info') => void;
  showWarning: (message: string, source?: string) => void;
  showInfo: (message: string, source?: string) => void;
  clearError: (errorId: string) => void;
  clearCurrentError: () => void;
  clearAllErrors: () => void;
  
  // Utility methods
  hasErrors: boolean;
  errorCount: number;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

interface GlobalErrorProviderProps {
  children: ReactNode;
}

export const GlobalErrorProvider: React.FC<GlobalErrorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const showError = useCallback((message: string, source?: string, variant: 'error' | 'warning' | 'info' = 'error') => {
    dispatch({
      type: 'ADD_ERROR',
      payload: { message, variant, source },
    });
  }, []);

  const showWarning = useCallback((message: string, source?: string) => {
    showError(message, source, 'warning');
  }, [showError]);

  const showInfo = useCallback((message: string, source?: string) => {
    showError(message, source, 'info');
  }, [showError]);

  const clearError = useCallback((errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: errorId });
  }, []);

  const clearCurrentError = useCallback(() => {
    if (state.currentError) {
      dispatch({ type: 'REMOVE_ERROR', payload: state.currentError.id });
    }
  }, [state.currentError]);

  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  const contextValue: GlobalErrorContextType = {
    ...state,
    showError,
    showWarning,
    showInfo,
    clearError,
    clearCurrentError,
    clearAllErrors,
    hasErrors: state.errors.length > 0,
    errorCount: state.errors.length,
  };

  return (
    <GlobalErrorContext.Provider value={contextValue}>
      {children}
    </GlobalErrorContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

export const useGlobalError = (): GlobalErrorContextType => {
  const context = useContext(GlobalErrorContext);
  if (context === undefined) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
};

// ==========================================
// ERROR BOUNDARY INTEGRATION
// ==========================================

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({ error, resetError }) => {
  const { showError } = useGlobalError();

  React.useEffect(() => {
    showError(
      `Application Error: ${error.message}`,
      'ErrorBoundary',
      'error'
    );
  }, [error, showError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-6xl mb-4">😓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            Don't worry, we've reported this error and our team will fix it soon!
          </p>
          <button
            onClick={resetError}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorContext;
