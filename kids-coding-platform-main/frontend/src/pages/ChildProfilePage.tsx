import React from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { Navigate } from 'react-router-dom';

const ChildProfilePage: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading, userType } = useFamilyAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if not a student account
  if (userType !== 'child') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(currentUser as any)?.displayName?.charAt(0).toUpperCase() || 
                   (currentUser as any)?.firstName?.charAt(0).toUpperCase() || 'K'}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Hi, {(currentUser as any)?.displayName || (currentUser as any)?.firstName || 'Coder'}! 👋
              </h1>
              <p className="text-gray-600">
                Welcome to your profile settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Mascot Settings Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🤖</span>
              Your Coding Companion - Bugsby
            </h2>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Mascot Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                  <img
                    src="/images/bugsby-mascot.png"
                    alt="Bugsby Mascot"
                    className="w-28 h-28 object-contain"
                    onError={(e) => {
                      // Fallback to a placeholder if image not found
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDExMiAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjU2IiBjeT0iNTYiIHI9IjU2IiBmaWxsPSIjNEE5MEUyIi8+Cjx0ZXh0IHg9IjU2IiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QnVnc2J5PC90ZXh0Pgo8L3N2Zz4=';
                    }}
                  />
                </div>
              </div>
              
              {/* Mascot Info and AI Suggestions */}
              <div className="flex-grow">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Meet Bugsby!</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Your friendly coding companion who helps you learn and create amazing projects.
                  </p>
                </div>
                
                {/* AI Suggestions */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <h4 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
                    <span className="mr-2">✨</span>
                    AI Suggestions for You
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-blue-700">
                      <span className="mr-2">🎯</span>
                      <span>Try the visual programming challenges - perfect for your learning style!</span>
                    </div>
                    <div className="flex items-center text-sm text-blue-700">
                      <span className="mr-2">🏆</span>
                      <span>You're ready for intermediate projects - let's build something cool!</span>
                    </div>
                    <div className="flex items-center text-sm text-blue-700">
                      <span className="mr-2">🤝</span>
                      <span>Bugsby suggests practicing loops next - they're super useful!</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {(currentUser as any)?.progress?.xp || 0}
                    </div>
                    <div className="text-xs text-gray-500">XP Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {(currentUser as any)?.progress?.badges?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Badges</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Future Settings Sections */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">⚙️</span>
              Settings
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-700">Sound Effects</span>
                  <p className="text-sm text-gray-500">Turn coding sounds on or off</p>
                </div>
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                  Coming Soon
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-700">Theme Colors</span>
                  <p className="text-sm text-gray-500">Customize your coding environment</p>
                </div>
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Back to Learning */}
          <div className="text-center">
            <a
              href="/learn"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
            >
              <span className="mr-2">🚀</span>
              Back to Learning
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildProfilePage;
