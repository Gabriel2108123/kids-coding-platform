import React from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ChildProfile } from '../types/family';

const AchievementsPage: React.FC = () => {
  const { currentUser, userType } = useFamilyAuth();
  const navigate = useNavigate();

  // Type guard to ensure currentUser is a ChildProfile
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;

  if (!childUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-xl text-gray-600">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  // Sample achievements data - in a real app this would come from backend
  const achievements = [
    {
      id: 'first_code',
      title: 'First Code',
      description: 'Write your first line of code',
      icon: '💻',
      earned: true,
      earnedDate: '2025-01-15',
    },
    {
      id: 'first_game',
      title: 'Game Creator',
      description: 'Create your first game',
      icon: '🎮',
      earned: true,
      earnedDate: '2025-01-16',
    },
    {
      id: 'week_streak',
      title: 'Week Warrior',
      description: 'Code for 7 days in a row',
      icon: '🔥',
      earned: (childUser.progress?.streakDays || 0) >= 7,
      earnedDate: (childUser.progress?.streakDays || 0) >= 7 ? '2025-01-17' : null,
    },
    {
      id: 'level_5',
      title: 'Rising Star',
      description: 'Reach level 5',
      icon: '⭐',
      earned: (childUser.progress?.level || 1) >= 5,
      earnedDate: (childUser.progress?.level || 1) >= 5 ? '2025-01-18' : null,
    },
    {
      id: 'badge_collector',
      title: 'Badge Collector',
      description: 'Earn 10 badges',
      icon: '🏆',
      earned: (childUser.progress?.badges?.length || 0) >= 10,
      earnedDate: (childUser.progress?.badges?.length || 0) >= 10 ? '2025-01-19' : null,
    },
    {
      id: 'module_master',
      title: 'Module Master',
      description: 'Complete 5 modules',
      icon: '📚',
      earned: (childUser.progress?.completedModules?.length || 0) >= 5,
      earnedDate: (childUser.progress?.completedModules?.length || 0) >= 5 ? '2025-01-20' : null,
    },
    {
      id: 'speed_coder',
      title: 'Speed Coder',
      description: 'Complete a challenge in under 5 minutes',
      icon: '⚡',
      earned: false,
      earnedDate: null,
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Get 100% on 3 quizzes',
      icon: '💯',
      earned: false,
      earnedDate: null,
    },
  ];

  const earnedAchievements = achievements.filter(a => a.earned);
  const lockedAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Achievements 🏆
          </h1>
          <p className="text-gray-600 text-xl">Your coding journey milestones</p>
        </div>

        {/* Achievement Summary */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                <div className="text-3xl font-bold text-orange-600 mb-1">{earnedAchievements.length}</div>
                <div className="text-sm font-medium text-orange-700">Achievements Earned</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-1">{achievements.length}</div>
                <div className="text-sm font-medium text-blue-700">Total Available</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.round((earnedAchievements.length / achievements.length) * 100)}%
                </div>
                <div className="text-sm font-medium text-green-700">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Earned Achievements */}
        <div className="max-w-6xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-yellow-500 mr-2">🌟</span>
            Earned Achievements ({earnedAchievements.length})
          </h2>
          
          {earnedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{achievement.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-2 border border-yellow-200">
                      <p className="text-xs font-medium text-orange-700">
                        Earned on {achievement.earnedDate ? new Date(achievement.earnedDate).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No achievements yet</h3>
              <p className="text-gray-600">Complete challenges and activities to earn your first achievement!</p>
            </div>
          )}
        </div>

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-gray-400 mr-2">🔒</span>
              Coming Soon ({lockedAchievements.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gray-50 rounded-xl shadow-lg border-2 border-gray-200 p-6 opacity-75"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 grayscale">{achievement.icon}</div>
                    <h3 className="text-lg font-bold text-gray-600 mb-2">{achievement.title}</h3>
                    <p className="text-gray-500 text-sm mb-3">{achievement.description}</p>
                    <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
                      <p className="text-xs font-medium text-gray-500">
                        🔒 Keep coding to unlock!
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
