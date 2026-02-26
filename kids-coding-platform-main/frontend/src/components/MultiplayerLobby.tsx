import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useCollaboration, CollaborationSession } from '../services/collaborationService';
import CollaborativeCodingRoom from './CollaborativeCodingRoom';

interface MultiplayerLobbyProps {
  user: User;
  onSessionJoined?: (session: CollaborationSession) => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  user,
  onSessionJoined
}) => {
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isInSession, setIsInSession] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  const {
    isConnected,
    error
    // createSession - TODO: Implement session creation functionality
  } = useCollaboration(user.username, user.username);

  // Mock data for active sessions (in production, this would come from the server)
  useEffect(() => {
    if (isConnected) {
      // Simulate fetching active sessions
      const mockSessions: CollaborationSession[] = [
        {
          id: 'session-1',
          title: 'Build a Space Game Together!',
          hostId: 'alex_codes',
          participants: [
            { id: 'alex_codes', username: 'Alex', color: '#FF6B6B', isActive: true },
            { id: 'maya_dev', username: 'Maya', color: '#4ECDC4', isActive: true }
          ],
          code: '',
          xml: '',
          isPublic: true,
          maxParticipants: 4,
          createdAt: new Date(Date.now() - 300000),
          gameType: 'space-adventure'
        },
        {
          id: 'session-2', 
          title: 'Learning Loops with Friends',
          hostId: 'teacher_sam',
          participants: [
            { id: 'teacher_sam', username: 'Teacher Sam', color: '#45B7D1', isActive: true },
            { id: 'student1', username: 'Emma', color: '#96CEB4', isActive: true },
            { id: 'student2', username: 'Jake', color: '#FECA57', isActive: false }
          ],
          code: '',
          xml: '',
          isPublic: true,
          maxParticipants: 6,
          createdAt: new Date(Date.now() - 600000),
          gameType: 'educational'
        },
        {
          id: 'session-3',
          title: 'Private Coding Club',
          hostId: 'coder_lily',
          participants: [
            { id: 'coder_lily', username: 'Lily', color: '#FF9FF3', isActive: true }
          ],
          code: '',
          xml: '',
          isPublic: false,
          maxParticipants: 3,
          createdAt: new Date(Date.now() - 150000),
          gameType: 'creative'
        }
      ];
      setActiveSessions(mockSessions);
    }
  }, [isConnected]);

  // Filter sessions based on search and filter type
  const filteredSessions = activeSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.hostId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'public' && session.isPublic) ||
                         (filterType === 'private' && !session.isPublic);
    return matchesSearch && matchesFilter;
  });

  const handleJoinSession = (session: CollaborationSession) => {
    setSelectedSession(session);
    setIsInSession(true);
    onSessionJoined?.(session);
  };

  const handleCreateSession = (session: CollaborationSession) => {
    setSelectedSession(session);
    setIsInSession(true);
    setShowCreateForm(false);
    onSessionJoined?.(session);
  };

  const handleLeaveSession = () => {
    setIsInSession(false);
    setSelectedSession(null);
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to multiplayer servers...</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  if (isInSession && selectedSession) {
    return (
      <CollaborativeCodingRoom
        sessionId={selectedSession.id}
        isHost={selectedSession.hostId === user.username}
        onSessionCreated={handleCreateSession}
        onSessionLeft={handleLeaveSession}
      />
    );
  }

  if (showCreateForm) {
    return (
      <CollaborativeCodingRoom
        isHost={true}
        onSessionCreated={handleCreateSession}
        onSessionLeft={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Multiplayer Coding Sessions
        </h1>
        <p className="text-gray-600">
          Join friends to code together in real-time!
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'public' | 'private')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Sessions</option>
          <option value="public">Public Only</option>
          <option value="private">Private Only</option>
        </select>

        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          Create Session
        </button>
      </div>

      {/* Active Sessions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map(session => (
          <div
            key={session.id}
            className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow"
          >
            {/* Session Header */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {session.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    by {session.hostId}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    session.isPublic 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.isPublic ? 'Public' : 'Private'}
                  </span>
                  
                  {session.gameType && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {session.gameType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  {session.participants.length}/{session.maxParticipants} participants
                </span>
                <span className="text-sm text-gray-500">
                  {getTimeAgo(session.createdAt)}
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                {session.participants.slice(0, 4).map(participant => (
                  <div
                    key={participant.id}
                    className="relative flex items-center"
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: participant.color }}
                      title={participant.username}
                    >
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    {participant.isActive && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                ))}
                
                {session.participants.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
                    +{session.participants.length - 4}
                  </div>
                )}

                {session.participants.length < session.maxParticipants && (
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">+</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleJoinSession(session)}
                disabled={session.participants.length >= session.maxParticipants}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  session.participants.length >= session.maxParticipants
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {session.participants.length >= session.maxParticipants 
                  ? 'Session Full' 
                  : 'Join Session'
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No sessions found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try a different search term or create your own session!'
              : 'Be the first to create a collaborative coding session!'
            }
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Create New Session
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-500">
            {activeSessions.length}
          </div>
          <div className="text-sm text-gray-600">Active Sessions</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-500">
            {activeSessions.reduce((sum, s) => sum + s.participants.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Online Coders</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-500">
            {activeSessions.filter(s => s.isPublic).length}
          </div>
          <div className="text-sm text-gray-600">Public Sessions</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-500">
            {new Set(activeSessions.map(s => s.gameType)).size}
          </div>
          <div className="text-sm text-gray-600">Game Types</div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerLobby;
