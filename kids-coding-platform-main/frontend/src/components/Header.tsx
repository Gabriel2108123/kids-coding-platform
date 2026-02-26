import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { getMascotById } from '../data/mascotData';
import { ChildProfile } from '../types/family';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const { currentUser, userType, logout } = useFamilyAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;
  
  // Helper function to get the selected mascot (single mascot system)
  const getSelectedMascot = (user: ChildProfile | null): string | null => {
    if (!user) return null;
    return user.settings?.learning?.visualPreferences?.[0] || null;
  };
  
  const selectedMascotId = getSelectedMascot(childUser);
  const selectedMascot = selectedMascotId ? getMascotById(selectedMascotId) : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <header className="bg-white shadow-xl border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-4 hover:scale-105 transition-transform">
            {/* Bugsby Mascot */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg p-1">
              <img 
                src="/images/bugsby-mascot.png" 
                alt="Bugsby Mascot" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('appName')}</h1>
              <p className="text-sm text-gray-600 font-medium">{t('appTagline')}</p>
            </div>
          </Link>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* XP Display */}
            <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-full border-2 border-blue-200">
              <span className="text-sm font-bold text-blue-800">Level {childUser?.progress?.level || 1}</span>
              <div className="w-8 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ 
                    width: `${(((childUser?.progress?.xp || 0) % 100) / 100) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs font-medium text-blue-600">{childUser?.progress?.xp || 0} XP</span>
            </div>

            {/* Mascot Avatar */}
            {selectedMascot && (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gradient-to-r from-pink-400 to-purple-500 shadow-md">
                <img
                  src={selectedMascot.avatar.static}
                  alt={selectedMascot.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Language Selector */}
            <LanguageSelector className="hidden md:block" />

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                {/* User Avatar */}
                {userType === 'child' && childUser?.avatar ? (
                  <img
                    src={childUser.avatar}
                    alt={childUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-400 shadow-md"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {userType === 'child' 
                      ? (childUser?.displayName || 'U').charAt(0).toUpperCase()
                      : ((currentUser as any)?.firstName || 'P').charAt(0).toUpperCase()
                    }
                  </div>
                )}
                <span className="hidden md:block font-semibold">
                  {userType === 'child' 
                    ? childUser?.displayName 
                    : `${(currentUser as any)?.firstName || 'Parent'}`
                  }
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-bold text-gray-800">
                      {userType === 'child' 
                        ? childUser?.displayName 
                        : `${(currentUser as any)?.firstName || 'Parent'}`
                      }
                    </p>
                    <p className="text-xs text-gray-600">{userType === 'child' ? 'Child Account' : 'Parent Account'}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  
                  {userType === 'child' && (
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-2">🤖</span>
                      Mascot Settings
                    </Link>
                  )}
                  
                  <Link
                    to="/achievements"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Achievements
                  </Link>

                  {userType === 'parent' && (
                    <Link
                      to="/parent"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Parent Dashboard
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
