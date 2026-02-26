import React, { useState } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';
import { ChildProfile } from '../types/family';

// Utility function to convert file to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const ParentDashboard: React.FC = () => {
  const familyAuth = useFamilyAuth();
  const {
    currentUser,
    family,
    addChild,
    updateChild,
    deleteChild,
    updateParentProfile,
    logout,
    userType,
    isLoading
  } = familyAuth;
  
  const navigate = useNavigate();
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [showParentProfileModal, setShowParentProfileModal] = useState(false);

  // Memoize children to prevent unnecessary re-renders and add safety checks
  const children = React.useMemo(() => {
    try {
      return family?.children || [];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error accessing children data:', error);
      return [];
    }
  }, [family?.children]);

  // Redirect if not a parent - but wait for auth to complete
  React.useEffect(() => {
    if (!isLoading && userType !== 'parent') {
      navigate('/login');
    }
  }, [userType, navigate, isLoading]);

  // Debug logging to help identify the key warning issue
  React.useEffect(() => {
    if (children.length > 0) {
      // eslint-disable-next-line no-console
      console.log('Children data in ParentDashboard:', children);
      // eslint-disable-next-line no-console
      console.log('Children IDs:', children.map(child => ({ 
        _id: child._id, 
        id: (child as any).id, 
        name: child.displayName,
        fullChild: child 
      })));
    }
  }, [children]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show loading while authentication is being restored
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-300 to-purple-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your family dashboard...</p>
        </div>
      </div>
    );
  }

  if (userType !== 'parent' || !currentUser) {
    return <div>Loading...</div>;
  }

  const parent = currentUser as any; // ParentAccount

  // Helper to refresh family data after child update
  const fetchFamily = (familyAuth as any).fetchFamily || (() => Promise.resolve());

  // Wrap updateChild to refresh family after edit
  const handleUpdateChild = async (childId: string, updates: any) => {
    try {
      // eslint-disable-next-line no-console
      console.log('ParentDashboard: Starting updateChild for:', childId);
      // eslint-disable-next-line no-console
      console.log('ParentDashboard: Updates to send:', updates);
      
      // Immediately update the editingChild state for instant UI feedback
      if (editingChild && (editingChild._id === childId || (editingChild as any).id === childId)) {
        setEditingChild(prev => prev ? { ...prev, ...updates } : null);
      }
      
      // The updates should already be in the correct format from EditChildModal
      await updateChild(childId, updates);
      
      // eslint-disable-next-line no-console
      console.log('ParentDashboard: UpdateChild completed successfully');
      
      // Force refresh family data after successful update
      if (fetchFamily) {
        await fetchFamily();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('ParentDashboard: UpdateChild failed:', error);
      // Re-throw the error so the modal can handle it
      throw error;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-300 to-purple-500" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center p-1">
                  <img 
                    src="/images/bugsby-mascot.png" 
                    alt="Bugsby Mascot" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Bugsby Coding World
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {parent.firstName || parent.displayName?.split(' ')[0] || 'Parent'}!
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Parent Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl"></span>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Parent Profile
              </h2>
            </div>
            <button
              onClick={() => setShowParentProfileModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <span>Edit Profile</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-semibold text-blue-700 mb-1">Name</label>
              <p className="text-gray-900 font-medium">{parent.displayName || 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
              <label className="block text-sm font-semibold text-green-700 mb-1">Email</label>
              <p className="text-gray-900 font-medium">{parent.email || 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
              <label className="block text-sm font-semibold text-orange-700 mb-1">Phone</label>
              <p className="text-gray-900 font-medium">{parent.phone || 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
              <label className="block text-sm font-semibold text-pink-700 mb-1">Address</label>
              <p className="text-gray-900 font-medium">{parent.address || 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
              <label className="block text-sm font-semibold text-indigo-700 mb-1">City</label>
              <p className="text-gray-900 font-medium">{parent.city || 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
              <label className="block text-sm font-semibold text-emerald-700 mb-1">State</label>
              <p className="text-gray-900 font-medium">{parent.state || 'Not set'}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100">
              <label className="block text-sm font-semibold text-cyan-700 mb-1">Language</label>
              <p className="text-gray-900 font-medium">{parent.preferredLanguage || 'English'}</p>
            </div>
          </div>
        </div>

        {/* Family Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg"></span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Family Overview
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {children.length}
              </div>
              <div className="text-sm font-medium text-purple-700 mt-1">Children</div>
            </div>
            <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {children.reduce((total, child) => {
                  try {
                    return total + ((child.progress as any)?.totalXP || 0);
                  } catch {
                    return total;
                  }
                }, 0)}
              </div>
              <div className="text-sm font-medium text-green-700 mt-1">Total XP Earned</div>
            </div>
            <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {children.reduce((total, child) => {
                  try {
                    return total + ((child.progress as any)?.completedModules || 0);
                  } catch {
                    return total;
                  }
                }, 0)}
              </div>
              <div className="text-sm font-medium text-blue-700 mt-1">Modules Completed</div>
            </div>
          </div>
        </div>

        {/* Family Achievements Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg"></span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Family Achievements
            </h2>
          </div>
          
          {children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                <div className="text-2xl mb-2"></div>
                <div className="text-2xl font-bold text-orange-600">
                  {children.length > 0 ? Math.max(...children.map(child => {
                    try {
                      return (child.progress as any)?.streakDays || 0;
                    } catch {
                      return 0;
                    }
                  })) : 0}
                </div>
                <div className="text-xs font-medium text-orange-700">Best Streak</div>
              </div>
              <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <div className="text-2xl mb-2"></div>
                <div className="text-2xl font-bold text-purple-600">
                  {children.reduce((total, child) => {
                    try {
                      return total + ((child.progress as any)?.completedChallenges || 0);
                    } catch {
                      return total;
                    }
                  }, 0)}
                </div>
                <div className="text-xs font-medium text-purple-700">Challenges Won</div>
              </div>
              <div className="text-center bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
                <div className="text-2xl mb-2"></div>
                <div className="text-2xl font-bold text-teal-600">
                  {Math.round(children.reduce((total, child) => {
                    try {
                      return total + ((child.progress as any)?.timeSpentLearning || 0);
                    } catch {
                      return total;
                    }
                  }, 0) / 60)}
                </div>
                <div className="text-xs font-medium text-teal-700">Hours Learned</div>
              </div>
              <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="text-2xl mb-2"></div>
                <div className="text-2xl font-bold text-indigo-600">
                  {children.reduce((total, child) => {
                    try {
                      return total + ((child.progress as any)?.badges || 0);
                    } catch {
                      return total;
                    }
                  }, 0)}
                </div>
                <div className="text-xs font-medium text-indigo-700">Badges Earned</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-4xl mb-3"></div>
              <p className="text-gray-600 font-medium">Family achievements will appear here once you add children!</p>
            </div>
          )}
        </div>

        {/* Children Management */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg"></span>
            </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Children's Accounts
              </h2>
            </div>
            <button
              onClick={() => setShowAddChildForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <span className="text-lg">+</span>
              <span>Add Child</span>
            </button>
          </div>

          {/* Children List */}
          {children.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No children added yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add your first child to get started with their exciting coding journey!
              </p>
              <button
                onClick={() => setShowAddChildForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Add Your First Child
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child, index) => (
                <ChildCard 
                  key={child._id || (child as any).id || `child-${index}`} 
                  child={child} 
                  onEdit={() => setEditingChild(child)}
                  onDelete={() => {
                    if (window.confirm(`Are you sure you want to remove ${child.displayName}?`)) {
                      deleteChild(child._id || (child as any).id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddChildForm && (
        <AddChildModal 
          onClose={() => setShowAddChildForm(false)}
          onSubmit={addChild}
          isLoading={isLoading}
        />
      )}

      {/* Edit Child Modal */}
      {editingChild && (
        <EditChildModal 
          child={editingChild}
          onClose={() => setEditingChild(null)}
          onSubmit={(updates) => handleUpdateChild(editingChild._id || (editingChild as any).id, updates)}
          isLoading={isLoading}
        />
      )}

      {/* Parent Profile Edit Modal */}
      {showParentProfileModal && (
        <EditParentProfileModal 
          parent={parent}
          onClose={() => setShowParentProfileModal(false)}
          onSubmit={updateParentProfile}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Child Card Component
interface ChildCardProps {
  child: ChildProfile;
  onEdit: () => void;
  onDelete: () => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, onEdit, onDelete }) => {
  const getAgeFromDateOfBirth = (dateOfBirth: Date | string) => {
    // First try to use the age field if it exists
    if ((child as any).age && !isNaN((child as any).age) && (child as any).age > 0) {
      return (child as any).age;
    }
    
    if (!dateOfBirth) return 'Unknown';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) {
      return 'Unknown';
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Generate a fun color based on child's name
  const getChildColor = (name: string) => {
    const colors = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400', 
      'from-green-400 to-teal-400',
      'from-orange-400 to-red-400',
      'from-indigo-400 to-purple-400',
      'from-pink-400 to-rose-400'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-200 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${getChildColor(child.displayName)} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-200 overflow-hidden`}>
            {child.avatar ? (
              <img 
                src={child.avatar} 
                alt={`${child.displayName}'s avatar`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = child.displayName.charAt(0).toUpperCase();
                    parent.className = `w-16 h-16 bg-gradient-to-br ${getChildColor(child.displayName)} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-200`;
                  }
                }}
              />
            ) : (
              child.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 text-lg">{child.displayName}</h3>
              {/* Removed mascot emoji */}
            </div>
            <p className="text-sm text-gray-600 font-medium">@{child.username}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-xl flex items-center justify-center text-blue-600 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Edit child"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 rounded-xl flex items-center justify-center text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Remove child"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
          <div className="text-xs font-semibold text-purple-700 mb-1">Age</div>
          <div className="text-lg font-bold text-purple-900">{getAgeFromDateOfBirth((child as any).dateOfBirth)} years old</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
          <div className="text-xs font-semibold text-green-700 mb-1">Level</div>
          <div className="text-lg font-bold text-green-900">{(child.progress as any)?.currentLevel || 1}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
          <div className="text-xs font-semibold text-blue-700 mb-1">XP</div>
          <div className="text-lg font-bold text-blue-900">{(child.progress as any)?.totalXP || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-xl border border-orange-100">
          <div className="text-xs font-semibold text-orange-700 mb-1">Modules</div>
          <div className="text-lg font-bold text-orange-900">{(child.progress as any)?.completedModules || 0}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">Last Active:</span>
          <span className="text-gray-800 font-medium">
            {(child.progress as any)?.lastActiveDate 
              ? new Date((child.progress as any).lastActiveDate).toLocaleDateString()
              : 'Never'
            }
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">Daily Limit:</span>
          <span className="text-gray-800 font-medium">
            {(child.safety as any)?.parentalControls?.timeLimit || (child.safety as any)?.maxDailyTime || 60} minutes
          </span>
        </div>
      </div>
    </div>
  );
};

// Add Child Modal Component
interface AddChildModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const AddChildModal: React.FC<AddChildModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: '',
    dateOfBirth: '',
    interests: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handled by context
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Child</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Alex Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="alex_coder"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Simple password for child"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Child Modal Component (simplified for now)
interface EditChildModalProps {
  child: ChildProfile;
  onClose: () => void;
  onSubmit: (updates: any) => Promise<void>;
  isLoading: boolean;
}

const EditChildModal: React.FC<EditChildModalProps> = ({ child, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    displayName: child.displayName,
    maxDailyTime: (child.safety as any)?.parentalControls?.timeLimit || (child.safety as any)?.maxDailyTime || 60,
    newPassword: '',
    confirmPassword: '',
    profilePicture: null as File | null,
    currentAvatar: child.avatar || '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    try {
      // Validate time limit
      if (formData.maxDailyTime < 15 || formData.maxDailyTime > 480) {
        setLocalError('Daily time limit must be between 15 and 480 minutes');
        return;
      }

      // Validate password reset if provided
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setLocalError('New passwords do not match');
        return;
      }

      if (formData.newPassword && formData.newPassword.length < 3) {
        setLocalError('Password must be at least 3 characters long');
        return;
      }

      // Prepare update object
      const updates: any = {
        displayName: formData.displayName,
        safety: {
          ...child.safety,
          parentalControls: {
            ...(child.safety as any)?.parentalControls,
            timeLimit: formData.maxDailyTime,
            allowedFeatures: (child.safety as any)?.parentalControls?.allowedFeatures || ['learn', 'practice'],
            requireApprovalForSharing: (child.safety as any)?.parentalControls?.requireApprovalForSharing || false,
            blockedWords: (child.safety as any)?.parentalControls?.blockedWords || []
          },
        },
      };

      // Add password reset if provided
      if (formData.newPassword) {
        updates.password = formData.newPassword;
      }

      // Handle profile picture upload
      if (formData.profilePicture) {
        // Convert image to base64 for storage
        try {
          const base64String = await convertFileToBase64(formData.profilePicture);
          updates.avatar = base64String;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error converting image to base64:', error);
          setLocalError('Failed to process profile picture. Please try again.');
          return;
        }
      }

      // eslint-disable-next-line no-console
      console.log('Submitting child update:', {
        childId: child._id,
        childObject: child,
        updates
      });
      
      await onSubmit(updates);
      onClose();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error updating child:', error);
      setLocalError(error?.message || error?.response?.data?.message || 'Failed to update child');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit {child.displayName}</h3>
        
        {/* Error Display */}
        {localError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-sm">⚠️</span>
              <p className="text-red-600 text-sm font-medium">{localError}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Time Limit (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="480"
              value={formData.maxDailyTime}
              onChange={(e) => setFormData(prev => ({ ...prev, maxDailyTime: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Between 15 minutes and 8 hours (480 minutes)</p>
          </div>

          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              {/* Current Avatar Preview */}
              {formData.currentAvatar && (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src={formData.currentAvatar} 
                    alt="Current avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-purple-100 text-purple-600 font-semibold text-lg hidden items-center justify-center">
                    {child.displayName.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              
              {/* File Upload */}
              <div className="flex-1">
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        setLocalError('Profile picture must be less than 5MB');
                        return;
                      }
                      
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        setLocalError('Please select a valid image file');
                        return;
                      }
                      
                      setFormData(prev => ({ ...prev, profilePicture: file }));
                      setLocalError(null);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="profilePicture"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors inline-block"
                >
                  Choose New Picture
                </label>
                {formData.profilePicture && (
                  <p className="text-xs text-green-600 mt-1">
                    New picture selected: {formData.profilePicture.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Upload a new profile picture (max 5MB, JPG/PNG)
                </p>
              </div>
            </div>
          </div>

          {/* Password Reset Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Password Reset
              </label>
              <button
                type="button"
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showPasswordReset ? 'Cancel' : 'Reset Password'}
              </button>
            </div>
            
            {showPasswordReset && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    minLength={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a simple password for {child.displayName} (min 3 characters)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    minLength={3}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-blue-700 text-xs">
                    <strong>Note:</strong> No old password verification required. The new password will be set immediately when you save changes.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Parent Profile Modal Component
interface EditParentProfileModalProps {
  parent: any;
  onClose: () => void;
  onSubmit: (updates: any) => Promise<void>;
  isLoading: boolean;
}

const EditParentProfileModal: React.FC<EditParentProfileModalProps> = ({ parent, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: parent.firstName || parent.displayName?.split(' ')[0] || '',
    lastName: parent.lastName || parent.displayName?.split(' ')[1] || '',
    email: parent.email || '',
    phone: parent.phone || '',
    address: parent.address || '',
    city: parent.city || '',
    state: parent.state || '',
    zipCode: parent.zipCode || '',
    country: parent.country || 'United States',
    preferredLanguage: parent.preferredLanguage || 'en',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password change if provided
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        alert('Current password is required to change password');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return;
      }
    }

    try {
      const updates: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        preferredLanguage: formData.preferredLanguage,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      // Only include password fields if changing password
      if (formData.newPassword) {
        updates.currentPassword = formData.currentPassword;
        updates.newPassword = formData.newPassword;
      }

      await onSubmit(updates);
      onClose();
    } catch (error) {
      // Error handled by context
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Parent Profile</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="New York"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="NY"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="10001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Language
            </label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
            </select>
          </div>

          {/* Password Change Section */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Change Password (Optional)</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="New password (min 6 characters)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentDashboard;
