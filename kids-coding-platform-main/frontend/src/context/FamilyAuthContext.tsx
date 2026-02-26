import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { familyAuthService } from '../services/familyAuthService';
import { ParentAccount, ChildProfile } from '../types/family';
import { useGlobalError } from './GlobalErrorContext';

// ==========================================
// TYPES
// ==========================================

export type UserType = 'parent' | 'child' | null;
export type CurrentUser = ParentAccount | ChildProfile | null;

export interface FamilyAuthState {
  userType: UserType;
  currentUser: CurrentUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Note: Removed error from local state - now using global error context
  
  // Parent-specific state
  family: {
    children: ChildProfile[];
    familyStats?: {
      totalXP: number;
      totalModulesCompleted: number;
      totalTimeSpent: number;
    };
  } | null;
  
  // Child-specific state
  permissions: {
    canCreateProjects: boolean;
    canShareProjects: boolean;
    maxDailyTime: number;
    allowedFeatures: string[];
  } | null;
}

// ==========================================
// ACTIONS
// ==========================================

type FamilyAuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'PARENT_LOGIN_SUCCESS'; payload: { user: ParentAccount; family: any } }
  | { type: 'CHILD_LOGIN_SUCCESS'; payload: { child: ChildProfile; permissions: any } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_FAMILY'; payload: { children: ChildProfile[] } }
  | { type: 'UPDATE_CHILD_PROGRESS'; payload: { childId: string; progress: any } };

// ==========================================
// REDUCER
// ==========================================

const initialState: FamilyAuthState = {
  userType: null,
  currentUser: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading=true to check authentication on app startup
  family: null,
  permissions: null,
};

function familyAuthReducer(state: FamilyAuthState, action: FamilyAuthAction): FamilyAuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'PARENT_LOGIN_SUCCESS':
      return {
        ...state,
        userType: 'parent',
        currentUser: action.payload.user,
        family: action.payload.family,
        isAuthenticated: true,
        isLoading: false,
        permissions: null,
      };
    
    case 'CHILD_LOGIN_SUCCESS':
      return {
        ...state,
        userType: 'child',
        currentUser: action.payload.child,
        permissions: action.payload.permissions,
        isAuthenticated: true,
        isLoading: false,
        family: null,
      };
    
    case 'LOGOUT':
      return {
        userType: null,
        currentUser: null,
        isAuthenticated: false,
        isLoading: false, // Set loading to false on logout
        family: null,
        permissions: null,
      };
    
    case 'UPDATE_FAMILY':
      return {
        ...state,
        family: state.family ? {
          ...state.family,
          children: action.payload.children
        } : null,
      };
    
    case 'UPDATE_CHILD_PROGRESS':
      if (state.userType === 'child' && state.currentUser) {
        const updatedChild = { ...state.currentUser as ChildProfile };
        updatedChild.progress = { ...updatedChild.progress, ...action.payload.progress };
        return {
          ...state,
          currentUser: updatedChild,
        };
      }
      return state;
    
    default:
      return state;
  }
}

// ==========================================
// CONTEXT
// ==========================================

interface FamilyAuthContextType extends FamilyAuthState {
  // Parent methods
  registerParent: (data: any) => Promise<void>;
  loginParent: (email: string, password: string) => Promise<void>;
  updateParentProfile: (updates: any) => Promise<void>;
  addChild: (childData: any) => Promise<void>;
  updateChild: (childId: string, updates: any) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;
  
  // Child methods
  loginChild: (username: string, password: string) => Promise<void>;
  updateChildProfile: (updates: any) => Promise<void>;
  
  // Shared methods
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

const FamilyAuthContext = createContext<FamilyAuthContextType | undefined>(undefined);

// ==========================================
// PROVIDER
// ==========================================

interface FamilyAuthProviderProps {
  children: ReactNode;
}

export const FamilyAuthProvider: React.FC<FamilyAuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(familyAuthReducer, initialState);
  const { showError } = useGlobalError();

  // ==========================================
  // INITIALIZATION
  // ==========================================

  const initializeAuth = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // eslint-disable-next-line no-console
      console.log('Initializing auth...');
      
      if (familyAuthService.isAuthenticated()) {
        const userType = familyAuthService.getCurrentUserType();
        // eslint-disable-next-line no-console
        console.log('User type detected:', userType);
        
        if (userType === 'parent') {
          // eslint-disable-next-line no-console
          console.log('Fetching parent profile...');
          const user = await familyAuthService.getParentProfile();
          // eslint-disable-next-line no-console
          console.log('Parent profile fetched:', user);
          
          // Fetch children separately
          // eslint-disable-next-line no-console
          console.log('Fetching children...');
          const children = await familyAuthService.getChildren();
          // eslint-disable-next-line no-console
          console.log('Children fetched:', children);
          
          const family = {
            children: children,
            familyStats: {
              totalXP: children.reduce((sum, child) => sum + (child.progress?.xp || 0), 0),
              totalModulesCompleted: children.reduce((sum, child) => sum + (child.progress?.completedModules?.length || 0), 0),
              totalTimeSpent: children.reduce((sum, child) => sum + (child.progress?.totalTimeSpent || 0), 0),
            },
          };
          
          dispatch({ 
            type: 'PARENT_LOGIN_SUCCESS', 
            payload: { user, family } 
          });
          // eslint-disable-next-line no-console
          console.log('Parent authentication restored successfully');
        } else if (userType === 'child') {
          // eslint-disable-next-line no-console
          console.log('Fetching child profile...');
          const child = await familyAuthService.getChildProfile();
          // eslint-disable-next-line no-console
          console.log('Child profile fetched:', child);
          
          const permissions = {
            canCreateProjects: true,
            canShareProjects: child.safety?.allowedDays?.length > 0,
            maxDailyTime: child.safety?.maxDailyTime || 60,
            allowedFeatures: [],
          };
          
          dispatch({ 
            type: 'CHILD_LOGIN_SUCCESS', 
            payload: { child, permissions } 
          });
          // eslint-disable-next-line no-console
          console.log('Child authentication restored successfully');
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('No authentication found - user needs to log in');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Auth initialization failed:', error);
      
      // If there's an authentication error, clean up tokens to force re-login
      if (error instanceof Error && (error.message.includes('Session expired') || error.message.includes('401'))) {
        // eslint-disable-next-line no-console
        console.log('Session expired - cleaning up tokens');
        familyAuthService.logout();
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ==========================================
  // PARENT METHODS
  // ==========================================

  const registerParent = useCallback(async (data: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await familyAuthService.registerParent(data);
      dispatch({ 
        type: 'PARENT_LOGIN_SUCCESS', 
        payload: { 
          user: result.data.user, 
          family: result.data.family || { children: [] } 
        } 
      });
    } catch (error: any) {
      showError(error.message, 'FamilyAuth');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [showError]);

  const loginParent = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // eslint-disable-next-line no-console
      console.log('Context: Starting parent login...');
      const result = await familyAuthService.loginParent(email, password);
      // eslint-disable-next-line no-console
      console.log('Context: Login service result:', result);
      
      // Fetch children separately after login
      const children = await familyAuthService.getChildren();
      const family = {
        children: children,
        familyStats: {
          totalXP: children.reduce((sum, child) => sum + (child.progress?.xp || 0), 0),
          totalModulesCompleted: children.reduce((sum, child) => sum + (child.progress?.completedModules?.length || 0), 0),
          totalTimeSpent: children.reduce((sum, child) => sum + (child.progress?.totalTimeSpent || 0), 0),
        },
      };
      
      dispatch({ 
        type: 'PARENT_LOGIN_SUCCESS', 
        payload: { 
          user: result.data.user, 
          family: family 
        } 
      });
      // eslint-disable-next-line no-console
      console.log('Context: Dispatched PARENT_LOGIN_SUCCESS with children:', children);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Context: Login error:', error);
      showError(error.message, 'FamilyAuth');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [showError]);

  const updateParentProfile = useCallback(async (updates: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    
    try {
      const updatedUser = await familyAuthService.updateParentProfile(updates);
      
      // Update the current user in state
      if (state.family) {
        dispatch({ 
          type: 'PARENT_LOGIN_SUCCESS', 
          payload: { 
            user: updatedUser, 
            family: state.family 
          } 
        });
      }
    } catch (error: any) {
      showError(error.message, 'FamilyAuth');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.family, showError]);

  const addChild = useCallback(async (childData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    
    try {
      await familyAuthService.addChild(childData);
      // Refresh children list after adding
      const children = await familyAuthService.getChildren();
      dispatch({ 
        type: 'UPDATE_FAMILY', 
        payload: { children: children } 
      });
    } catch (error: any) {
      showError(error.message, 'FamilyAuth');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [showError]);

  const updateChild = useCallback(async (childId: string, updates: any) => {
    try {
      const updatedChild = await familyAuthService.updateChild(childId, updates);
      const currentChildren = state.family?.children || [];
      const updatedChildren = currentChildren.map(child => 
        child._id === childId ? updatedChild : child
      );
      dispatch({ 
        type: 'UPDATE_FAMILY', 
        payload: { children: updatedChildren } 
      });
    } catch (error: any) {
      showError(error.message, 'FamilyAuth');
      throw error;
    }
  }, [state.family?.children, showError]);

  const deleteChild = useCallback(async (childId: string) => {
    try {
      await familyAuthService.deleteChild(childId);
      const currentChildren = state.family?.children || [];
      const updatedChildren = currentChildren.filter(child => child._id !== childId);
      dispatch({ 
        type: 'UPDATE_FAMILY', 
        payload: { children: updatedChildren } 
      });
    } catch (error: any) {
      showError(error.message, 'FamilyAuth');
      throw error;
    }
  }, [state.family?.children, showError]);

  // ==========================================
  // CHILD METHODS
  // ==========================================

  const loginChild = useCallback(async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    
    try {
      const result = await familyAuthService.loginChild(username, password);
      dispatch({ 
        type: 'CHILD_LOGIN_SUCCESS', 
        payload: { 
          child: result.data.user, 
          permissions: result.data.permissions || {
            canCreateProjects: true,
            canShareProjects: false,
            maxDailyTime: 60,
            allowedFeatures: []
          }
        } 
      });
    } catch (error: any) {
      showError(error.message, 'FamilyAuth');
      throw error;
    }
  }, [showError]);

  const updateChildProfile = useCallback(async (updates: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const updatedChild = await familyAuthService.updateChildProfile(updates);
      
      // Update the current user in state if it's a child
      if (state.userType === 'child') {
        dispatch({ 
          type: 'CHILD_LOGIN_SUCCESS', 
          payload: { 
            child: updatedChild, 
            permissions: state.permissions || {
              canCreateProjects: true,
              canShareProjects: false,
              maxDailyTime: 60,
              allowedFeatures: []
            }
          } 
        });
      }
    } catch (error: any) {
      showError(error.message, 'FamilyAuth');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.userType, state.permissions, showError]);

  // ==========================================
  // SHARED METHODS
  // ==========================================

  const logout = useCallback(() => {
    familyAuthService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const contextValue: FamilyAuthContextType = {
    ...state,
    registerParent,
    loginParent,
    updateParentProfile,
    addChild,
    updateChild,
    deleteChild,
    loginChild,
    updateChildProfile,
    logout,
    initializeAuth,
  };

  return (
    <FamilyAuthContext.Provider value={contextValue}>
      {children}
    </FamilyAuthContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

export const useFamilyAuth = (): FamilyAuthContextType => {
  const context = useContext(FamilyAuthContext);
  if (context === undefined) {
    throw new Error('useFamilyAuth must be used within a FamilyAuthProvider');
  }
  return context;
};

export default FamilyAuthContext;
