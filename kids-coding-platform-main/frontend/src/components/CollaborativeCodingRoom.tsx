import React, { useState, useEffect, useRef } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { ChildProfile } from '../types/family';
import { useCollaboration, CollaborationSession } from '../services/collaborationService';
import BlocklyEditor from '../editor/BlocklyEditor';
import PhaserGameEngine from '../engine/PhaserGameEngine';
import { GameConfig, GameObjects, GameSound } from '../types';

interface CollaborativeCodingRoomProps {
  sessionId?: string;
  isHost?: boolean;
  onSessionCreated?: (session: CollaborationSession) => void;
  onSessionLeft?: () => void;
}

const CollaborativeCodingRoom: React.FC<CollaborativeCodingRoomProps> = ({
  sessionId,
  isHost = false,
  onSessionCreated,
  onSessionLeft
}) => {
  const { currentUser, userType } = useFamilyAuth();
  
  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;
  
  const {
    isConnected,
    currentSession,
    participants,
    chatMessages,
    error,
    createSession,
    joinSession,
    leaveSession,
    sendCodeChange,
    sendCursorMove,
    sendChatMessage,
    runCode
  } = useCollaboration(childUser?.username || (currentUser as any)?.firstName || '', childUser?.displayName || (currentUser as any)?.firstName || '');

  const [blocklyCode, setBlocklyCode] = useState<string>('');
  const [blocklyXml, setBlocklyXml] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionType, setSessionType] = useState<'public' | 'private'>('public');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [showSessionCreator, setShowSessionCreator] = useState(!sessionId && isHost);

  const gameEngineRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Join existing session or wait for creation
  useEffect(() => {
    if (sessionId && !currentSession) {
      joinSession(sessionId).catch((err) => {
        // Handle join session error silently or show user notification
      });
    }
  }, [sessionId, currentSession, joinSession]);

  // Handle code changes from Blockly
  const handleCodeChange = (code: string, xml: string) => {
    setBlocklyCode(code);
    setBlocklyXml(xml);
    
    // Send changes to other participants
    if (currentSession) {
      sendCodeChange(code, xml);
    }
  };

  // Handle running the code
  const handleRunCode = async () => {
    if (!blocklyCode) return;
    
    setIsRunning(true);
    
    try {
      // Parse the Blockly code to create a game configuration
      const gameConfig = parseBlocklyToGameConfig(blocklyCode);
      
      // Notify other participants that code is running
      if (currentSession) {
        runCode(blocklyCode);
      }
      
      // Run the code in the game engine
      if (gameEngineRef.current) {
        await gameEngineRef.current.loadGame(gameConfig);
      }
    } catch (error) {
      // Handle error silently or show user notification
    } finally {
      setIsRunning(false);
    }
  };

  // Handle cursor movement for collaborative editing
  const handleMouseMove = (event: React.MouseEvent) => {
    if (currentSession) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      sendCursorMove(x, y);
    }
  };

  // Create a new collaboration session
  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) return;
    
    try {
      const session = await createSession({
        title: sessionTitle,
        isPublic: sessionType === 'public',
        maxParticipants,
        code: blocklyCode,
        xml: blocklyXml,
        gameType: 'blockly'
      });
      
      setShowSessionCreator(false);
      onSessionCreated?.(session);
    } catch (error) {
      // Handle error silently or show user notification
    }
  };

  // Handle chat message sending
  const handleSendChatMessage = () => {
    if (chatInput.trim() && currentSession) {
      sendChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  // Handle leaving the session
  const handleLeaveSession = () => {
    leaveSession();
    onSessionLeft?.();
  };

  // Parse Blockly code to game configuration
  const parseBlocklyToGameConfig = (code: string): GameConfig => {
    // Simple parser for demonstration - in production, you'd want a more robust parser
    const gameConfig: GameConfig = {
      type: 'click',
      title: currentSession?.title || 'Collaborative Game',
      objects: [] as GameObjects[],
      sounds: [] as GameSound[],
      userCode: code
    };

    // Parse simple game elements from code
    if (code.includes('sprite')) {
      gameConfig.objects.push({
        type: 'sprite',
        x: 400,
        y: 300,
        texture: 'player'
      } as GameObjects);
    }

    if (code.includes('sound')) {
      gameConfig.sounds.push({
        key: 'click',
        url: '/sounds/click.mp3'
      } as GameSound);
    }

    return gameConfig;
  };

  // Render cursor indicators for other participants
  const renderCollaborativeCursors = () => {
    return participants
      .filter(p => p.id !== (childUser?.username || (currentUser as any)?.firstName) && p.cursor && p.isActive)
      .map(participant => (
        <div
          key={participant.id}
          className="absolute pointer-events-none z-50 transition-all duration-200"
          style={{
            left: `${participant.cursor!.x}%`,
            top: `${participant.cursor!.y}%`,
            color: participant.color
          }}
        >
          <div className="flex items-center space-x-1">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: participant.color }}
            />
            <span className="text-xs font-medium bg-white px-2 py-1 rounded shadow">
              {participant.username}
            </span>
          </div>
        </div>
      ));
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to collaboration server...</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  if (showSessionCreator) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Collaboration Session</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Title
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter session title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as 'public' | 'private')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Participants
            </label>
            <input
              type="number"
              min="2"
              max="8"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCreateSession}
              disabled={!sessionTitle.trim()}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Session
            </button>
            <button
              onClick={() => setShowSessionCreator(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse rounded-full h-12 w-12 bg-blue-200 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaboration session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">{currentSession.title}</h1>
            <span className="text-sm text-gray-500">
              Session: {currentSession.id.slice(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Participants */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {participants.length}/{currentSession.maxParticipants}
              </span>
              <div className="flex -space-x-2">
                {participants.slice(0, 4).map(participant => (
                  <div
                    key={participant.id}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: participant.color }}
                    title={participant.username}
                  >
                    {participant.username.charAt(0).toUpperCase()}
                  </div>
                ))}
                {participants.length > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                    +{participants.length - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
            </button>
            
            <button
              onClick={handleRunCode}
              disabled={!blocklyCode || isRunning}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            
            <button
              onClick={handleLeaveSession}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Code Editor */}
        <div 
          className="flex-1 relative"
          onMouseMove={handleMouseMove}
        >
          {renderCollaborativeCursors()}
          <BlocklyEditor
            onChange={handleCodeChange}
            initialCode={currentSession.xml}
            readOnly={false}
          />
        </div>

        {/* Game Preview */}
        <div className="w-1/3 bg-white border-l">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-medium text-gray-800">Live Game Preview</h3>
          </div>
          <div className="h-full">
            <PhaserGameEngine
              gameCode={blocklyCode}
              gameType="blank"
            />
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-medium text-gray-800">Team Chat</h3>
            </div>
            
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {chatMessages.map(message => (
                <div key={message.id} className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-1">
                    <span 
                      className={`text-xs font-medium ${
                        message.userId === 'system' ? 'text-gray-500' : 'text-gray-700'
                      }`}
                    >
                      {message.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div 
                    className={`text-sm p-2 rounded ${
                      message.userId === (childUser?.username || (currentUser as any)?.firstName)
                        ? 'bg-blue-500 text-white self-end' 
                        : message.userId === 'system'
                        ? 'bg-gray-100 text-gray-600 italic'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim()}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeCodingRoom;
