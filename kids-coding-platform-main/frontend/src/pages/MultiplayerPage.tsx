import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MultiplayerLobby from '../components/MultiplayerLobby';
import CollaborativeCodingRoom from '../components/CollaborativeCodingRoom';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { ChildProfile } from '../types/family';
import { normalizeAgeGroup, getAgeFromAgeGroup } from '../utils/ageGroupUtils';

const MultiplayerPage: React.FC = () => {
  const { currentUser, userType, isAuthenticated } = useFamilyAuth();

  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to join multiplayer coding sessions.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <MultiplayerLobby 
                user={{
                  id: childUser?._id || currentUser._id,
                  username: childUser?.username || (currentUser as any)?.firstName || 'User',
                  email: childUser?.username || (currentUser as any)?.email || '',
                  displayName: childUser?.displayName || (currentUser as any)?.firstName || 'User',
                  role: userType as any,
                  age: getAgeFromAgeGroup(childUser?.ageGroup),
                  ageGroup: normalizeAgeGroup(childUser?.ageGroup).backend,
                  xp: childUser?.progress?.xp || 0,
                  level: childUser?.progress?.level || 1,
                  preferences: {
                    theme: childUser?.preferences?.theme || 'colorful',
                    language: 'en'
                  }
                }} 
              />
            } 
          />
          <Route 
            path="/session/:sessionId" 
            element={<CollaborativeCodingRoom />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </Router>
    </div>
  );
};

export default MultiplayerPage;
