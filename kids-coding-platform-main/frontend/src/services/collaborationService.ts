import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

// Types for multiplayer collaboration
export interface CollaborationUser {
  id: string;
  username: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
}

export interface CollaborationSession {
  id: string;
  title: string;
  hostId: string;
  participants: CollaborationUser[];
  code: string;
  xml: string;
  isPublic: boolean;
  maxParticipants: number;
  createdAt: Date;
  gameType?: string;
}

export interface CollaborationEvent {
  type: 'code_change' | 'cursor_move' | 'user_join' | 'user_leave' | 'chat_message' | 'run_code';
  userId: string;
  data: any;
  timestamp: Date;
}

// Socket.IO client wrapper for collaboration
class CollaborationSocket {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(serverUrl: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.socket = io(serverUrl, {
        autoConnect: true,
        timeout: 5000,
        retries: 3
      });

      this.socket.on('connect', () => {
        // eslint-disable-next-line no-console
        console.log('🔗 Connected to collaboration server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        // eslint-disable-next-line no-console
        console.log('🔌 Disconnected from collaboration server:', reason);
        this.isConnected = false;
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          this.attemptReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        // eslint-disable-next-line no-console
        console.error('❌ Connection error:', error);
        reject(error);
      });

      // Set connection timeout
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      // eslint-disable-next-line no-console
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.socket?.connect();
      }, 1000 * this.reconnectAttempts);
    } else {
      // eslint-disable-next-line no-console
      console.error('❌ Max reconnection attempts reached');
    }
  }

  joinSession(sessionId: string, user: Partial<CollaborationUser>): Promise<CollaborationSession> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('join_session', { sessionId, user }, (response: any) => {
        if (response.success) {
          resolve(response.session);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  createSession(sessionData: Partial<CollaborationSession>): Promise<CollaborationSession> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('create_session', sessionData, (response: any) => {
        if (response.success) {
          resolve(response.session);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  sendCodeChange(sessionId: string, code: string, xml: string) {
    this.socket?.emit('code_change', { sessionId, code, xml });
  }

  sendCursorMove(sessionId: string, x: number, y: number) {
    this.socket?.emit('cursor_move', { sessionId, x, y });
  }

  sendChatMessage(sessionId: string, message: string) {
    this.socket?.emit('chat_message', { sessionId, message });
  }

  runCode(sessionId: string, code: string) {
    this.socket?.emit('run_code', { sessionId, code });
  }

  leaveSession(sessionId: string) {
    this.socket?.emit('leave_session', { sessionId });
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Singleton instance
const collaborationSocket = new CollaborationSocket();

// React hook for collaboration
export const useCollaboration = (userId: string, username: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [participants, setParticipants] = useState<CollaborationUser[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<CollaborationSocket>(collaborationSocket);

  useEffect(() => {
    const socket = socketRef.current;

    // Connect to collaboration server
    socket.connect()
      .then(() => {
        setIsConnected(true);
        setError(null);
      })
      .catch((err) => {
        setError(`Failed to connect: ${err.message}`);
        setIsConnected(false);
      });

    // Set up event listeners
    socket.on('user_joined', (data: { user: CollaborationUser }) => {
      setParticipants(prev => [...prev.filter(p => p.id !== data.user.id), data.user]);
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: 'system',
        username: 'System',
        message: `${data.user.username} joined the session`,
        timestamp: new Date()
      }]);
    });

    socket.on('user_left', (data: { userId: string; username: string }) => {
      setParticipants(prev => prev.filter(p => p.id !== data.userId));
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: 'system',
        username: 'System',
        message: `${data.username} left the session`,
        timestamp: new Date()
      }]);
    });

    socket.on('code_changed', (data: { code: string; xml: string; userId: string }) => {
      if (currentSession) {
        setCurrentSession(prev => prev ? { ...prev, code: data.code, xml: data.xml } : null);
      }
    });

    socket.on('cursor_moved', (data: { userId: string; x: number; y: number }) => {
      setParticipants(prev => prev.map(p => 
        p.id === data.userId ? { ...p, cursor: { x: data.x, y: data.y } } : p
      ));
    });

    socket.on('chat_message', (data: { userId: string; username: string; message: string; timestamp: string }) => {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: data.userId,
        username: data.username,
        message: data.message,
        timestamp: new Date(data.timestamp)
      }]);
    });

    socket.on('code_run', (data: { userId: string; code: string }) => {
      // Handle collaborative code execution
      // eslint-disable-next-line no-console
      console.log(`User ${data.userId} ran code:`, data.code);
    });

    // Cleanup
    return () => {
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('code_changed');
      socket.off('cursor_moved');
      socket.off('chat_message');
      socket.off('code_run');
    };
  }, [currentSession, userId]);

  const createSession = async (sessionData: Partial<CollaborationSession>) => {
    try {
      const session = await socketRef.current.createSession({
        ...sessionData,
        hostId: userId
      });
      setCurrentSession(session);
      return session;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const session = await socketRef.current.joinSession(sessionId, {
        id: userId,
        username,
        color: generateUserColor(userId),
        isActive: true
      });
      setCurrentSession(session);
      setParticipants(session.participants);
      return session;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const leaveSession = () => {
    if (currentSession) {
      socketRef.current.leaveSession(currentSession.id);
      setCurrentSession(null);
      setParticipants([]);
      setChatMessages([]);
    }
  };

  const sendCodeChange = (code: string, xml: string) => {
    if (currentSession) {
      socketRef.current.sendCodeChange(currentSession.id, code, xml);
    }
  };

  const sendCursorMove = (x: number, y: number) => {
    if (currentSession) {
      socketRef.current.sendCursorMove(currentSession.id, x, y);
    }
  };

  const sendChatMessage = (message: string) => {
    if (currentSession) {
      socketRef.current.sendChatMessage(currentSession.id, message);
    }
  };

  const runCode = (code: string) => {
    if (currentSession) {
      socketRef.current.runCode(currentSession.id, code);
    }
  };

  return {
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
  };
};

// Helper function to generate consistent colors for users
function generateUserColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#00D2D3', '#FF9F43', '#EE5A24', '#0984E3'
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export default collaborationSocket;
