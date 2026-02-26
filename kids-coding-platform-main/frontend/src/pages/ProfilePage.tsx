import React, { useState } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ChildProfile } from '../types/family';
import { getAgeGroupLabel } from '../utils/ageGroupUtils';
import { convertFileToBase64, validateImageFile } from '../utils/imageUtils';

const ProfilePage: React.FC = () => {
  const { currentUser, userType, updateChildProfile } = useFamilyAuth();
  const navigate = useNavigate();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Type guard to ensure currentUser is a ChildProfile
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setLocalError(null);

      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setLocalError(validation.error || 'Invalid file');
        return;
      }

      // Convert to base64
      const base64String = await convertFileToBase64(file);

      // Update profile with new avatar
      await updateChildProfile({ avatar: base64String });

      setIsEditingAvatar(false);
    } catch (error: any) {
      setLocalError(error.message || 'Failed to update profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  if (!childUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-xl text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Profile Settings
          </h1>
          <p className="text-gray-600 text-xl">Manage your account settings and preferences</p>
        </div>

        {/* Error Display */}
        {localError && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-red-500 text-sm">⚠️</span>
                <p className="text-red-600 text-sm font-medium">{localError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Avatar Section */}
            <div className="text-center">
              <div className="relative group mx-auto mb-4 w-32 h-32">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                  {childUser.avatar ? (
                    <img 
                      src={childUser.avatar} 
                      alt={`${childUser.displayName}'s avatar`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = childUser.displayName.charAt(0).toUpperCase();
                        }
                      }}
                    />
                  ) : (
                    childUser.displayName.charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* Edit Avatar Button */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => setIsEditingAvatar(true)}
                    disabled={isLoading}
                    className="text-white text-sm font-medium bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Change Photo'}
                  </button>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{childUser.displayName}</h2>
              <p className="text-gray-600">@{childUser.username}</p>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-sm font-semibold text-blue-700 mb-1">Display Name</label>
                <p className="text-gray-900 font-medium">{childUser.displayName}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
                <label className="block text-sm font-semibold text-green-700 mb-1">Age Group</label>
                <p className="text-gray-900 font-medium">
                  {getAgeGroupLabel(childUser.ageGroup)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <label className="block text-sm font-semibold text-purple-700 mb-1">Current Level</label>
                <p className="text-gray-900 font-medium">Level {childUser.progress?.level || 1}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                <label className="block text-sm font-semibold text-orange-700 mb-1">Total XP</label>
                <p className="text-gray-900 font-medium">{childUser.progress?.xp || 0} points</p>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Your Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{childUser.progress?.completedModules?.length || 0}</div>
                <div className="text-sm font-medium text-blue-700">Modules Completed</div>
              </div>
              <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="text-2xl font-bold text-green-600">{childUser.progress?.badges?.length || 0}</div>
                <div className="text-sm font-medium text-green-700">Badges Earned</div>
              </div>
              <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{childUser.progress?.streakDays || 0}</div>
                <div className="text-sm font-medium text-purple-700">Day Streak</div>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">{Math.round((childUser.progress?.totalTimeSpent || 0) / 60)}</div>
                <div className="text-sm font-medium text-orange-700">Hours Learned</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {isEditingAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Profile Picture</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a new profile picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a profile picture (max 5MB, JPG/PNG)
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingAvatar(false);
                    setLocalError(null);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
