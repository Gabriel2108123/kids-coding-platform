import React from 'react';
import Header from '../components/Header';

const GameLibraryPage: React.FC = () => {

  // Mock games data - in real app this would be fetched from API
  const userGames = [
    {
      id: '1',
      title: 'My First Click Game',
      description: 'A simple clicking game I created',
      createdAt: '2024-01-15',
      plays: 23,
      rating: 4.5,
      thumbnail: '🖱️',
      type: 'click-game'
    },
    {
      id: '2',
      title: 'Space Adventure',
      description: 'Fly through space and collect stars',
      createdAt: '2024-01-20',
      plays: 45,
      rating: 4.8,
      thumbnail: '🚀',
      type: 'adventure'
    },
    {
      id: '3',
      title: 'Math Quiz Master',
      description: 'Test your math skills with this quiz',
      createdAt: '2024-01-25',
      plays: 67,
      rating: 4.3,
      thumbnail: '🧮',
      type: 'quiz'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">My Games Library 🎮</h1>
          <p className="text-gray-600 text-lg">
            All the amazing games you've created and played
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600">{userGames.length}</div>
            <div className="text-gray-600">Games Created</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600">
              {userGames.reduce((sum, game) => sum + game.plays, 0)}
            </div>
            <div className="text-gray-600">Total Plays</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600">
              {(userGames.reduce((sum, game) => sum + game.rating, 0) / userGames.length).toFixed(1)}
            </div>
            <div className="text-gray-600">Avg Rating</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-orange-600">3</div>
            <div className="text-gray-600">Shared Games</div>
          </div>
        </div>

        {/* Game Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {['All Games', 'Click Games', 'Adventure', 'Quiz', 'Puzzle', 'Arcade'].map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full transition-colors ${
                  category === 'All Games'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {userGames.map((game) => (
            <div key={game.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                <div className="text-6xl">{game.thumbnail}</div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{game.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm text-gray-600">{game.rating}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {game.plays} plays
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Play
                  </button>
                  <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    📤
                  </button>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Created: {new Date(game.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Create New Game Card */}
          <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl shadow-lg border-2 border-dashed border-green-300 flex items-center justify-center hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">➕</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Create New Game</h3>
              <p className="text-gray-600 text-sm mb-4">Start building your next amazing game</p>
              <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition-colors">
                Start Building
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mr-4">
                🎮
              </div>
              <div className="flex-1">
                <p className="text-gray-800">Someone played your "Space Adventure" game!</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mr-4">
                ⭐
              </div>
              <div className="flex-1">
                <p className="text-gray-800">Your "Math Quiz Master" received a 5-star rating!</p>
                <p className="text-sm text-gray-600">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white mr-4">
                🏆
              </div>
              <div className="flex-1">
                <p className="text-gray-800">You earned the "Game Creator" badge!</p>
                <p className="text-sm text-gray-600">3 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Showcase */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Game Development Achievements</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🎮', title: 'First Game', description: 'Created your first game' },
              { icon: '⭐', title: '5-Star Game', description: 'Game rated 5 stars' },
              { icon: '📈', title: '100 Plays', description: 'Game played 100 times' },
              { icon: '🎯', title: 'Quiz Master', description: 'Created a quiz game' }
            ].map((achievement, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h3 className="font-semibold text-gray-800 text-sm">{achievement.title}</h3>
                <p className="text-xs text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLibraryPage;
