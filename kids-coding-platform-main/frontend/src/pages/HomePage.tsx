import React, { useState, useEffect } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';
import MascotSelector from '../components/MascotSelector';
import DashboardMap from '../components/DashboardMap';
import Header from '../components/Header';
import XPProgressBar from '../components/XPProgressBar';
import { ChildProfile } from '../types/family';

const HomePage: React.FC = () => {
  const familyAuth = useFamilyAuth();
  const { currentUser, userType } = familyAuth;
  const navigate = useNavigate();
  const [showMascotSelector, setShowMascotSelector] = useState(false);

  // Type guard to ensure currentUser is a ChildProfile
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;

  useEffect(() => {
    // Helper function to get the selected mascot (single mascot system)
    const getSelectedMascot = (user: ChildProfile | null): string | null => {
      if (!user) return null;

      // Get mascot from settings.learning.visualPreferences[0]
      return user.settings?.learning?.visualPreferences?.[0] || null;
    };

    // Helper function to determine if this is the child's first login
    const isFirstLogin = (user: ChildProfile | null): boolean => {
      if (!user) return false;

      // Check if user has never completed any modules and has no mascot
      const hasCompletedModules = user.progress?.completedModules && user.progress.completedModules.length > 0;
      const hasMascot = getSelectedMascot(user) !== null;

      return !hasCompletedModules && !hasMascot;
    };

    // Debug logging to understand mascot selector logic
    // eslint-disable-next-line no-console
    console.log('HomePage useEffect - childUser:', childUser);
    // eslint-disable-next-line no-console
    console.log('Child age group:', childUser?.ageGroup);
    // eslint-disable-next-line no-console
    console.log('Child settings:', childUser?.settings);
    // eslint-disable-next-line no-console
    console.log('Child learning settings:', childUser?.settings?.learning);
    // eslint-disable-next-line no-console
    console.log('Child visual preferences:', childUser?.settings?.learning?.visualPreferences);

    // Check if mascot is already selected using helper function
    const selectedMascot = getSelectedMascot(childUser);
    const firstLogin = isFirstLogin(childUser);

    // eslint-disable-next-line no-console
    console.log('Selected mascot from backend:', selectedMascot);
    // eslint-disable-next-line no-console
    console.log('Is first login:', firstLogin);
    // eslint-disable-next-line no-console
    console.log('Should show mascot selector:', childUser && !selectedMascot);

    // Show mascot selector for first-time users
    if (childUser && !selectedMascot) {
      setShowMascotSelector(true);
    } else if (selectedMascot) {
      // eslint-disable-next-line no-console
      console.log('Mascot already selected for this child:', selectedMascot);
      setShowMascotSelector(false);
    }
  }, [childUser, navigate]);

  if (!childUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-xl text-gray-600">Loading your coding adventure...</p>
        </div>
      </div>
    );
  }

  const handleMascotSelection = async (mascotId: string) => {
    try {
      if (!childUser) {
        // eslint-disable-next-line no-console
        console.error('No child user found');
        return;
      }

      // eslint-disable-next-line no-console
      console.log('Child selected mascot:', mascotId);

      // Direct API call to update mascot (simplified since settings are removed)
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/mascot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mascotId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mascot');
      }

      const result = await response.json();

      // eslint-disable-next-line no-console
      console.log('Mascot update result:', result);

      // eslint-disable-next-line no-console
      console.log('Mascot selection successful, hiding selector');

      // Hide the mascot selector immediately since we know the update was successful
      setShowMascotSelector(false);

      // Refresh child profile to get updated data with the new mascot
      if ((familyAuth as any).initializeAuth) {
        // eslint-disable-next-line no-console
        console.log('Refreshing child profile after mascot selection...');
        await (familyAuth as any).initializeAuth();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating child mascot:', error);
    }
  };

  if (showMascotSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <MascotSelector
          onSelect={handleMascotSelection}
          userLevel={childUser.progress?.level || 1}
          userBadges={childUser.progress?.badges || []}
          completedModules={childUser.progress?.completedModules || []}
          userXP={childUser.progress?.xp || 0}
        />
      </div>
    );
  }

  const handleStartLearning = () => {
    // Age-based navigation to appropriate learning experience
    if (childUser) {
      const ageGroup = childUser.ageGroup;
      if (ageGroup === 'young_learners') {
        navigate('/learn');
      } else if (ageGroup === 'elementary') {
        navigate('/learn/interactive');
      } else if (ageGroup === 'advanced') {
        navigate('/learn/advanced');
      } else {
        // Fallback to general learn page
        navigate('/learn');
      }
    } else {
      navigate('/learn');
    }
  };

  const handleStartBuilding = () => {
    navigate('/build');
  };

  const handleViewGames = () => {
    navigate('/games');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 bg-dots">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 glow-text">
            Welcome back to Bugsby Coding World, {childUser.displayName}!
          </h1>
          <p className="text-gray-600 text-xl">Ready for your next coding adventure with Bugsby?</p>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-8">
          <XPProgressBar
            currentXP={childUser.progress?.xp || 0}
            currentLevel={childUser.progress?.level || 1}
            maxWidth="100%"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-blue-100 hover:border-blue-300 transition-all">
            <div className="text-3xl font-bold text-blue-600 mb-1">{childUser.progress?.level || 1}</div>
            <div className="text-gray-600 text-base font-medium">Level</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-green-100 hover:border-green-300 transition-all">
            <div className="text-3xl font-bold text-green-600 mb-1">{childUser.progress?.completedModules?.length || 0}</div>
            <div className="text-gray-600 text-base font-medium">Modules</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-purple-100 hover:border-purple-300 transition-all">
            <div className="text-3xl font-bold text-purple-600 mb-1">{childUser.progress?.badges?.length || 0}</div>
            <div className="text-gray-600 text-base font-medium">Badges</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-orange-100 hover:border-orange-300 transition-all">
            <div className="text-3xl font-bold text-orange-600 mb-1">{childUser.progress?.streakDays || 0}</div>
            <div className="text-gray-600 text-base font-medium">Streak</div>
          </div>
        </div>

        {/* Main Dashboard Map */}
        <div className="mb-8">
          <DashboardMap
            completedModules={childUser.progress?.completedModules || []}
            currentModule={childUser.progress?.currentModule}
            userLevel={childUser.progress?.level || 1}
            onModuleSelect={(moduleId) => navigate(`/learn/${moduleId}`)}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="icon-lg text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Learn</h3>
              <p className="text-gray-600 text-base mb-4">Continue your coding journey with interactive lessons</p>
              <button
                onClick={handleStartLearning}
                className="btn w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                Start Learning
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition-all card-interactive">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="icon-lg text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Build</h3>
              <p className="text-gray-600 text-base mb-4">Create amazing games and projects with your skills</p>
              <button
                onClick={handleStartBuilding}
                className="btn w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                Start Building
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all card-interactive">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="icon-lg text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-6 0a1 1 0 100-2H5a1 1 0 100 2zm0 0h6a1 1 0 110 2H9a1 1 0 110-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">My Games</h3>
              <p className="text-gray-600 text-base mb-4">Play and share the games you've created</p>
              <button
                onClick={handleViewGames}
                className="btn w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                View Games
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100 hover:border-yellow-300 hover:shadow-xl transition-all card-interactive">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Badges</h3>
              <p className="text-gray-600 text-base mb-4">View your achievements and track progress</p>
              <button
                onClick={() => navigate('/badges')}
                className="btn w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                View Badges
              </button>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        {(childUser.progress?.badges?.length || 0) > 0 && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border-2 border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">Recent Badges</span>
                <span className="text-2xl">🏆</span>
              </h3>
              <button
                onClick={() => navigate('/badges')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
              >
                View All Badges →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(childUser.progress?.badges || []).slice(-3).map((badge: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/badges')}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full flex items-center justify-center mr-3 shadow-md">
                    <span className="text-lg">🏆</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-base">{badge}</div>
                    <div className="text-xs text-gray-600">Recently earned</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/badges')}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                🏅 View Badge Collection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
