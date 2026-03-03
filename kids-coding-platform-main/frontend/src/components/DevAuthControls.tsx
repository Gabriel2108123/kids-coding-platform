import React from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';

const DevAuthControls: React.FC = () => {
  const { logout, currentUser, userType, loginChild, loginParent } = useFamilyAuth();
  const navigate = useNavigate();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const clearAllAuth = () => {
    localStorage.clear();
    window.location.reload();
  };

  const quickLoginChild = async () => {
    try {
      await loginChild('childtester@kids.local', 'password123');
      navigate('/');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Quick login child failed:', error);
    }
  };

  const quickLoginParent = async () => {
    try {
      await loginParent('parent@test.local', 'Password123!');
      navigate('/parent-dashboard');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Quick login parent failed:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 rounded-lg p-3 shadow-lg z-50 max-w-xs">
      <div className="text-xs font-bold text-red-800 mb-2">🔧 DEV TOOLS</div>

      {/* Current User Info */}
      {currentUser && (
        <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
          <div className="font-medium">Current User:</div>
          <div>Type: {userType}</div>
          <div>Name: {
            userType === 'child'
              ? (currentUser as any)?.displayName
              : (currentUser as any)?.firstName
          }</div>
        </div>
      )}

      <div className="space-y-1">
        {/* Quick Login Buttons */}
        {!currentUser && (
          <>
            <button
              onClick={quickLoginChild}
              className="block w-full text-left text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              title="Login as Test_1 / Test1234"
            >
              👶 Quick Login Child
            </button>
            <button
              onClick={quickLoginParent}
              className="block w-full text-left text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              title="Login as gaby89_pana@yahoo.com / Test1234"
            >
              👨‍👩‍👧‍👦 Quick Login Parent
            </button>
            <div className="border-t border-gray-300 my-2"></div>
          </>
        )}

        {/* Logout/Clear Buttons */}
        {currentUser && (
          <button
            onClick={logout}
            className="block w-full text-left text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
          >
            🚪 Logout User
          </button>
        )}

        <button
          onClick={clearAllAuth}
          className="block w-full text-left text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          🗑️ Clear All Auth
        </button>

        {/* Quick Navigation */}
        {currentUser && (
          <>
            <div className="border-t border-gray-300 my-2"></div>
            <div className="text-xs text-gray-600 mb-1">Quick Nav:</div>
            {userType === 'child' && (
              <>
                <button
                  onClick={() => navigate('/settings')}
                  className="block w-full text-left text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 mb-1"
                >
                  🤖 Mascot Settings
                </button>
                <button
                  onClick={() => navigate('/learn')}
                  className="block w-full text-left text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600"
                >
                  📚 Learn Page
                </button>
              </>
            )}
            {userType === 'parent' && (
              <button
                onClick={() => navigate('/parent-dashboard')}
                className="block w-full text-left text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600"
              >
                📊 Parent Dashboard
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DevAuthControls;
