const ActiveCallSession = require('../models/CallSession/ActiveCallSession');
const CallSession = require('../models/CallSession/CallSession');
const CallRequest = require('../models/CallSession/CallRequest');
const Psychic = require('../models/HumanChat/Psychic');
const User = require('../models/User');

module.exports = (io, twilioService) => {
  const audioNamespace = io.of('/audio-calls');
  
  console.log('🎧 Audio namespace initialized at /audio-calls');
  
  // Store socket connections
  const psychicConnections = new Map();
  const userConnections = new Map();
  
  audioNamespace.on('connection', (socket) => {
    console.log(`🎧 Audio socket connected: ${socket.id}`);
    console.log('🔍 Connection details:', socket.handshake.query);
    
    // Add ping handler
    socket.on('ping', (data) => {
      console.log('🏓 Ping received:', data);
      socket.emit('pong', { ...data, receivedAt: new Date() });
    });
    
    // Psychic connects with their ID
    socket.on('psychic-register', async (psychicId) => {
      try {
        console.log(`🎧 Psychic registration attempt: ${psychicId} from socket ${socket.id}`);
        
        const psychic = await Psychic.findById(psychicId);
        if (psychic) {
          psychicConnections.set(psychicId, socket.id);
          socket.psychicId = psychicId;
          
          // Update psychic status to online
          psychic.status = 'online';
          psychic.socketId = socket.id;
          psychic.lastSeen = new Date();
          await psychic.save();
          
          console.log(`✅ Psychic ${psychicId} registered for audio calls`);
          
          // Send registration success
          socket.emit('registration-success', {
            message: 'Registered successfully for audio calls',
            socketId: socket.id,
            psychicId: psychicId,
            psychicName: psychic.name
          });
          
          // Notify psychic of pending calls
          const pendingRequests = await CallRequest.find({
            psychicId,
            status: 'pending',
            expiresAt: { $gt: new Date() }
          }).populate('userId', 'firstName lastName image email phone');
          
          console.log(`📋 Found ${pendingRequests.length} pending calls for psychic ${psychicId}`);
          
          if (pendingRequests.length > 0) {
            // Format the data to match frontend expectations
            const formattedCalls = pendingRequests.map(call => ({
              _id: call._id,
              callRequestId: call._id,
              userId: call.userId._id,
              user: {
                _id: call.userId._id,
                firstName: call.userId.firstName,
                lastName: call.userId.lastName,
                image: call.userId.image,
                email: call.userId.email,
                phone: call.userId.phone
              },
              status: call.status,
              requestedAt: call.requestedAt,
              expiresAt: call.expiresAt,
              roomName: call.roomName,
              creditsPerMin: call.creditsPerMin,
              ratePerMin: call.ratePerMin,
              isFreeSession: call.isFreeSession
            }));
            
            socket.emit('pending-calls', formattedCalls);
          } else {
            socket.emit('pending-calls', []);
          }
          
          // Join psychic's personal room
          socket.join(`psychic_${psychicId}`);
          console.log(`✅ Psychic ${psychicId} joined room psychic_${psychicId}`);
          
        } else {
          console.error(`❌ Psychic not found: ${psychicId}`);
          socket.emit('registration-error', {
            message: 'Psychic not found'
          });
        }
      } catch (error) {
        console.error('❌ Error registering psychic:', error);
        socket.emit('registration-error', {
          message: 'Error registering psychic',
          error: error.message
        });
      }
    });
    
    // User connects with their ID
    socket.on('user-register', async (userId) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          userConnections.set(userId, socket.id);
          socket.userId = userId;
          
          // Update user last seen
          user.lastSeen = new Date();
          user.socketId = socket.id;
          await user.save();
          
          console.log(`✅ User ${userId} registered for audio calls`);
        }
      } catch (error) {
        console.error('❌ Error registering user:', error);
      }
    });
    
    // Psychic accepts call request
    socket.on('accept-call', async (data) => {
      try {
        console.log('✅ Accept call received:', data);
        const { callRequestId, roomName } = data;
        
        const callRequest = await CallRequest.findById(callRequestId)
          .populate('userId', 'firstName lastName image')
          .populate('psychicId', 'name image');
        
        if (!callRequest || callRequest.status !== 'pending') {
          socket.emit('call-error', { message: 'Invalid call request' });
          return;
        }
        
        // Update call request
        callRequest.status = 'accepted';
        callRequest.respondedAt = new Date();
        await callRequest.save();
        
        // Create call session
        const callSession = new ActiveCallSession({
          roomName: callRequest.roomName || roomName,
          userId: callRequest.userId._id,
          psychicId: callRequest.psychicId._id,
          status: 'ringing',
          creditsPerMin: callRequest.creditsPerMin,
          ratePerMin: callRequest.ratePerMin,
          userCreditsAtRequest: callRequest.userCreditsAtRequest,
          isFreeSession: callRequest.isFreeSession
        });
        
        await callSession.save();
        
        // Generate Twilio tokens
        const tokens = twilioService.generateParticipantTokens(
          callRequest.userId._id,
          callRequest.psychicId._id,
          callRequest.roomName || roomName
        );
        
        callSession.participantTokens = {
          user: tokens.user,
          psychic: tokens.psychic
        };
        await callSession.save();
        
        // Notify user
        const userSocketId = userConnections.get(callRequest.userId._id.toString());
        if (userSocketId) {
          audioNamespace.to(userSocketId).emit('call-accepted', {
            callSessionId: callSession._id,
            roomName: callRequest.roomName || roomName,
            token: tokens.user,
            psychic: {
              name: callRequest.psychicId.name,
              image: callRequest.psychicId.image
            }
          });
        }
        
        // Send token to psychic
        socket.emit('call-token', {
          token: tokens.psychic,
          roomName: callRequest.roomName || roomName,
          callSessionId: callSession._id,
          psychicId: callRequest.psychicId._id,
          userId: callRequest.userId._id
        });
        
        // Update psychic status
        await Psychic.findByIdAndUpdate(callRequest.psychicId._id, {
          status: 'busy',
          lastActive: new Date()
        });
        
        console.log(`✅ Call accepted: ${callRequestId}, session: ${callSession._id}`);
        
      } catch (error) {
        console.error('❌ Error accepting call:', error);
        socket.emit('call-error', { 
          message: 'Failed to accept call',
          error: error.message 
        });
      }
    });
    
    // Psychic rejects call request
    socket.on('reject-call', async (data) => {
      try {
        const { callRequestId, reason } = data;
        const callRequest = await CallRequest.findById(callRequestId)
          .populate('userId');
        
        if (!callRequest) {
          socket.emit('call-error', { message: 'Invalid call request' });
          return;
        }
        
        callRequest.status = 'rejected';
        callRequest.rejectionReason = reason;
        callRequest.respondedAt = new Date();
        await callRequest.save();
        
        // Notify user
        const userSocketId = userConnections.get(callRequest.userId._id.toString());
        if (userSocketId) {
          audioNamespace.to(userSocketId).emit('call-rejected', {
            callRequestId,
            reason
          });
        }
        
        // Update psychic status back to online
        await Psychic.findByIdAndUpdate(callRequest.psychicId, {
          status: 'online',
          lastActive: new Date()
        });
        
      } catch (error) {
        console.error('❌ Error rejecting call:', error);
      }
    });
    
    // User cancels call
    socket.on('cancel-call', async (data) => {
      try {
        const { callRequestId } = data;
        const callRequest = await CallRequest.findById(callRequestId)
          .populate('psychicId');
        
        if (!callRequest) return;
        
        callRequest.status = 'cancelled';
        callRequest.respondedAt = new Date();
        await callRequest.save();
        
        // Notify psychic if they're online
        const psychicSocketId = psychicConnections.get(callRequest.psychicId._id.toString());
        if (psychicSocketId) {
          audioNamespace.to(psychicSocketId).emit('call-cancelled', {
            callRequestId,
            userId: callRequest.userId
          });
        }
        
        // Update psychic status
        await Psychic.findByIdAndUpdate(callRequest.psychicId._id, {
          status: 'online',
          lastActive: new Date()
        });
        
      } catch (error) {
        console.error('❌ Error cancelling call:', error);
      }
    });
    
    // Call started (participants connected)
    socket.on('call-started', async (data) => {
      try {
        const { callSessionId } = data;
        const callSession = await ActiveCallSession.findById(callSessionId);
        
        if (!callSession) return;
        
        callSession.status = 'in-progress';
        callSession.startTime = new Date();
        callSession.lastChargeTime = new Date();
        await callSession.save();
        
        // Start timer for both participants
        const userSocketId = userConnections.get(callSession.userId.toString());
        const psychicSocketId = psychicConnections.get(callSession.psychicId.toString());
        
        if (userSocketId) {
          audioNamespace.to(userSocketId).emit('timer-started', {
            callSessionId,
            startTime: callSession.startTime
          });
        }
        
        if (psychicSocketId) {
          audioNamespace.to(psychicSocketId).emit('timer-started', {
            callSessionId,
            startTime: callSession.startTime
          });
        }
        
        console.log(`🎉 Call started: ${callSessionId}`);
        
      } catch (error) {
        console.error('❌ Error starting call:', error);
      }
    });
    
    // Call ended
    socket.on('call-ended', async (data) => {
      try {
        const { callSessionId, endReason } = data;
        const callSession = await ActiveCallSession.findById(callSessionId);
        
        if (!callSession) return;
        
        callSession.status = 'ended';
        callSession.endTime = new Date();
        callSession.endReason = endReason;
        
        // Calculate duration
        if (callSession.startTime) {
          const durationMs = callSession.endTime - callSession.startTime;
          callSession.durationSeconds = Math.floor(durationMs / 1000);
          
          // Calculate credits used
          const minutesUsed = Math.ceil(callSession.durationSeconds / 60);
          callSession.totalCreditsUsed = minutesUsed * callSession.creditsPerMin;
        }
        
        await callSession.save();
        
        // Archive to CallSession
        const archivedSession = new CallSession({
          callSid: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          roomName: callSession.roomName,
          userId: callSession.userId,
          psychicId: callSession.psychicId,
          status: 'completed',
          startTime: callSession.startTime,
          endTime: callSession.endTime,
          durationSeconds: callSession.durationSeconds,
          ratePerMin: callSession.ratePerMin,
          creditsPerMin: callSession.creditsPerMin,
          totalCreditsUsed: callSession.totalCreditsUsed,
          endReason: callSession.endReason,
          userPlatform: callSession.userPlatform,
          psychicPlatform: callSession.psychicPlatform
        });
        
        await archivedSession.save();
        
        // Delete active session
        await ActiveCallSession.deleteOne({ _id: callSessionId });
        
        // Update psychic status
        await Psychic.findByIdAndUpdate(callSession.psychicId, {
          status: 'online',
          lastActive: new Date()
        });
        
        // Notify both participants
        const userSocketId = userConnections.get(callSession.userId.toString());
        const psychicSocketId = psychicConnections.get(callSession.psychicId.toString());
        
        if (userSocketId) {
          audioNamespace.to(userSocketId).emit('call-completed', {
            callSessionId,
            duration: callSession.durationSeconds,
            creditsUsed: callSession.totalCreditsUsed
          });
        }
        
        if (psychicSocketId) {
          audioNamespace.to(psychicSocketId).emit('call-completed', {
            callSessionId,
            duration: callSession.durationSeconds
          });
        }
        
        console.log(`📞 Call ended: ${callSessionId}, duration: ${callSession.durationSeconds}s`);
        
      } catch (error) {
        console.error('❌ Error ending call:', error);
      }
    });
    
    // Signal: Ice candidate exchange
    socket.on('signal-ice-candidate', (data) => {
      const { target, candidate, roomName } = data;
      
      // Forward ICE candidate to target
      socket.to(roomName).emit('signal-ice-candidate', {
        from: socket.id,
        candidate,
        roomName
      });
    });
    
    // Signal: Offer/Answer exchange
    socket.on('signal-sdp', (data) => {
      const { target, sdp, type, roomName } = data;
      
      // Forward SDP to target
      socket.to(roomName).emit('signal-sdp', {
        from: socket.id,
        sdp,
        type,
        roomName
      });
    });
    
    // Join room for peer-to-peer signaling
    socket.on('join-room', (roomName) => {
      socket.join(roomName);
      console.log(`🎧 Socket ${socket.id} joined room ${roomName}`);
      
      // Notify others in the room
      socket.to(roomName).emit('user-joined', {
        userId: socket.userId || socket.psychicId,
        socketId: socket.id
      });
    });
    
    // Leave room
    socket.on('leave-room', (roomName) => {
      socket.leave(roomName);
      socket.to(roomName).emit('user-left', {
        socketId: socket.id
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`🎧 Audio socket disconnected: ${socket.id}`);
      
      // Clean up psychic connection
      if (socket.psychicId) {
        psychicConnections.delete(socket.psychicId);
        
        // Update psychic status
        await Psychic.findByIdAndUpdate(socket.psychicId, {
          socketId: null,
          status: 'offline',
          lastSeen: new Date()
        });
      }
      
      // Clean up user connection
      if (socket.userId) {
        userConnections.delete(socket.userId);
        
        // Update user last seen
        await User.findByIdAndUpdate(socket.userId, {
          socketId: null,
          lastSeen: new Date()
        });
      }
    });
  });
  
  // Helper function to notify psychic of new call
  const notifyPsychicOfCall = async (psychicId, callRequest) => {
    const psychicSocketId = psychicConnections.get(psychicId);
    
    if (psychicSocketId) {
      audioNamespace.to(psychicSocketId).emit('incoming-call', {
        callRequestId: callRequest._id,
        userId: callRequest.userId._id,
        user: {
          _id: callRequest.userId._id,
          firstName: callRequest.userId.firstName,
          lastName: callRequest.userId.lastName,
          image: callRequest.userId.image
        },
        roomName: callRequest.roomName,
        requestedAt: callRequest.requestedAt,
        expiresAt: callRequest.expiresAt,
        isFreeSession: callRequest.isFreeSession
      });
      
      console.log(`📞 Sent incoming call notification to psychic ${psychicId}`);
      return true;
    }
    
    console.log(`❌ Psychic ${psychicId} not connected to audio namespace`);
    return false;
  };
  
  return {
    notifyPsychicOfCall,
    psychicConnections,
    userConnections,
    audioNamespace
  };
};