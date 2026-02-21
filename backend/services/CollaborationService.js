import EditingSession from '../models/EditingSessionModel.js';
import { generateObjectId } from '../utils/ObjectIdGenerator.js';

class CollaborationService {
  constructor(io) {
    this.io = io;
    this.sessions = new Map();
    this.initializeSessionCleanup();
  }

  // Create a new collaborative editing session
  async createEditingSession(userId, username, mediaUrl, expiresInHours = 2) {
    try {
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
      
      const session = new EditingSession({
        sessionId,
        mediaUrl,
        participants: [{
          userId,
          username,
          joinedAt: new Date(),
          isActive: true
        }],
        edits: [],
        expiresAt,
        _id: generateObjectId()
      });

      await session.save();
      
      // Store in memory for real-time operations
      this.sessions.set(sessionId, {
        sessionId,
        mediaUrl,
        participants: new Map([[userId.toString(), { username, joinedAt: new Date() }]]),
        edits: []
      });

      return session;
    } catch (error) {
      throw new Error(`Failed to create editing session: ${error.message}`);
    }
  }

  // Join an existing editing session
  async joinEditingSession(sessionId, userId, username) {
    try {
      const session = await EditingSession.findOne({ 
        sessionId, 
        expiresAt: { $gt: new Date() },
        isActive: true 
      });

      if (!session) {
        throw new Error('Session not found or expired');
      }

      // Check if user is already in the session
      const existingParticipant = session.participants.find(
        p => p.userId && p.userId.toString() === userId.toString()
      );

      if (!existingParticipant) {
        session.participants.push({
          userId,
          username,
          joinedAt: new Date(),
          isActive: true
        });

        await session.save();
      }

      // Update in-memory session
      if (this.sessions.has(sessionId)) {
        const memSession = this.sessions.get(sessionId);
        memSession.participants.set(userId.toString(), { username, joinedAt: new Date() });
      }

      // Notify other participants
      if (this.io) {
        this.io.to(sessionId).emit('user-joined', {
          userId,
          username,
          timestamp: new Date()
        });
      }

      return session;
    } catch (error) {
      throw new Error(`Failed to join editing session: ${error.message}`);
    }
  }

  // Add an edit to the session
  async addEdit(sessionId, userId, editData) {
    try {
      const session = await EditingSession.findOne({ 
        sessionId, 
        expiresAt: { $gt: new Date() },
        isActive: true 
      });

      if (!session) {
        throw new Error('Session not found or expired');
      }

      const edit = {
        userId,
        timestamp: new Date(),
        editType: editData.type,
        editData: editData.data
      };

      session.edits.push(edit);
      await session.save();

      // Update in-memory session
      if (this.sessions.has(sessionId)) {
        const memSession = this.sessions.get(sessionId);
        memSession.edits.push(edit);
      }

      // Broadcast edit to all participants
      if (this.io) {
        this.io.to(sessionId).emit('edit-added', {
          edit,
          userId,
          timestamp: new Date()
        });
      }

      return edit;
    } catch (error) {
      throw new Error(`Failed to add edit: ${error.message}`);
    }
  }

  // Get session data
  async getSessionData(sessionId) {
    try {
      const session = await EditingSession.findOne({ 
        sessionId, 
        expiresAt: { $gt: new Date() },
        isActive: true 
      });

      if (!session) {
        throw new Error('Session not found or expired');
      }

      return {
        sessionId: session.sessionId,
        mediaUrl: session.mediaUrl,
        participants: session.participants.filter(p => p.isActive),
        editCount: session.edits.length,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      };
    } catch (error) {
      throw new Error(`Failed to get session data: ${error.message}`);
    }
  }

  // Leave editing session
  async leaveEditingSession(sessionId, userId) {
    try {
      const session = await EditingSession.findOne({ sessionId });
      
      if (session) {
        // Mark participant as inactive
        const participant = session.participants.find(
          p => p.userId && p.userId.toString() === userId.toString()
        );
        
        if (participant) {
          participant.isActive = false;
          await session.save();
        }

        // Remove from in-memory session
        if (this.sessions.has(sessionId)) {
          const memSession = this.sessions.get(sessionId);
          memSession.participants.delete(userId.toString());
        }

        // Notify other participants
        if (this.io) {
          this.io.to(sessionId).emit('user-left', {
            userId,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error(`Failed to leave editing session: ${error.message}`);
    }
  }

  // End editing session
  async endEditingSession(sessionId) {
    try {
      await EditingSession.updateOne(
        { sessionId },
        { 
          isActive: false,
          expiresAt: new Date() // Expire immediately
        }
      );

      // Remove from memory
      this.sessions.delete(sessionId);

      // Notify all participants
      if (this.io) {
        this.io.to(sessionId).emit('session-ended', {
          sessionId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      throw new Error(`Failed to end editing session: ${error.message}`);
    }
  }

  // Get active sessions for a user
  async getUserActiveSessions(userId) {
    try {
      const sessions = await EditingSession.find({
        'participants.userId': userId,
        'participants.isActive': true,
        expiresAt: { $gt: new Date() },
        isActive: true
      }).sort({ createdAt: -1 });

      return sessions;
    } catch (error) {
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Setup Socket.IO listeners for real-time collaboration
  setupSocketListeners(socket) {
    // Join editing session
    socket.on('join-editing-session', async (data) => {
      try {
        const { sessionId, userId, username } = data;
        await this.joinEditingSession(sessionId, userId, username);
        socket.join(sessionId);
        
        socket.emit('session-joined', {
          sessionId,
          message: 'Successfully joined editing session'
        });
      } catch (error) {
        socket.emit('error', {
          message: `Failed to join session: ${error.message}`
        });
      }
    });

    // Add edit
    socket.on('add-edit', async (data) => {
      try {
        const { sessionId, userId, editData } = data;
        await this.addEdit(sessionId, userId, editData);
      } catch (error) {
        socket.emit('error', {
          message: `Failed to add edit: ${error.message}`
        });
      }
    });

    // Leave session
    socket.on('leave-editing-session', async (data) => {
      try {
        const { sessionId, userId } = data;
        await this.leaveEditingSession(sessionId, userId);
        socket.leave(sessionId);
      } catch (error) {
        console.error('Error leaving session:', error);
      }
    });
  }

  // Periodic cleanup of expired sessions
  initializeSessionCleanup() {
    setInterval(async () => {
      try {
        const expiredSessions = await EditingSession.find({
          expiresAt: { $lt: new Date() },
          isActive: true
        });

        for (const session of expiredSessions) {
          await this.endEditingSession(session.sessionId);
        }
      } catch (error) {
        console.error('Session cleanup error:', error);
      }
    }, 300000); // Run every 5 minutes
  }
}

export default CollaborationService;