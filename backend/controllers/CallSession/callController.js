const CallSession = require('../../models/CallSession/CallSession');
const ActiveCallSession = require('../../models/CallSession/ActiveCallSession');
const CallRequest = require('../../models/CallSession/CallRequest');
const Psychic = require('../../models/HumanChat/Psychic');
const User = require('../../models/User');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');


let io;
let twilioService;

const setSocketIO = (socketIO) => {
  io = socketIO;
};

const setTwilioService = (service) => {
  twilioService = service;
};


const initiateCall = async (req, res) => {
  try {
    const { psychicId } = req.params;
    const userId = req.user._id;
    
    console.log(`📞 User ${userId} initiating call to psychic ${psychicId}`);
    
    // ONLY CHECK: If user already has an ACTIVE (in-progress) call with this psychic
    const existingActiveCall = await ActiveCallSession.findOne({
      userId,
      psychicId,
      status: { $in: ['ringing', 'in-progress'] }
    });
    
    if (existingActiveCall) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active call with this psychic',
        existingSessionId: existingActiveCall._id
      });
    }
    
    // Check psychic availability
    const psychic = await Psychic.findById(psychicId);
    if (!psychic) {
      return res.status(404).json({ success: false, message: 'Psychic not found' });
    }
    
    if (psychic.status !== 'online' && psychic.status !== 'away') {
      return res.status(400).json({
        success: false,
        message: 'Psychic is not available for calls right now',
        psychicStatus: psychic.status
      });
    }
    
    // Check user credits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const hasFreeSession = !user.hasUsedFreeAudioMinute;
    let creditsPerMin = psychic.creditsPerMin || 1;
    
    if (hasFreeSession) {
      creditsPerMin = 0;
    } else if (user.credits < creditsPerMin) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits to initiate call'
      });
    }
    
    // Generate room and tokens
    const roomName = `audio_${uuidv4().replace(/-/g, '')}_${Date.now()}`;
    const callIdentifier = `call_${uuidv4().replace(/-/g, '')}_${Date.now()}`;
    
    let userToken = 'dummy_user_token';
    if (global.twilioService && global.twilioService.isReady && global.twilioService.isReady()) {
      try {
        userToken = global.twilioService.generateVoiceToken(userId, 'client');
      } catch (error) {
        userToken = `dummy_token_user_${userId}`;
      }
    }
    
    // Create call request (ALLOW MULTIPLE REQUESTS)
    const callRequest = new CallRequest({
      userId,
      psychicId,
      status: 'pending',
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 1000),
      ratePerMin: psychic.ratePerMin || 1,
      creditsPerMin,
      userCreditsAtRequest: user.credits || 0,
      callIdentifier,
      userToken,
      roomName
    });
    
    await callRequest.save();
    
    // Create active session
    const activeSession = new ActiveCallSession({
      roomName,
      callIdentifier,
      userId,
      psychicId,
      status: 'initiated',
      creditsPerMin,
      ratePerMin: psychic.ratePerMin || 1,
      isFreeSession: hasFreeSession,
      participantTokens: { user: userToken, psychic: null },
      callRequestId: callRequest._id
    });
    
    await activeSession.save();
    
    // Notify psychic via socket
    const audioNamespace = io.of('/audio-calls');
    const psychicSocketId = psychic.socketId;
    
    if (psychicSocketId && audioNamespace) {
      audioNamespace.to(psychicSocketId).emit('incoming-call', {
        callRequestId: callRequest._id,
        callSessionId: activeSession._id,
        userId,
        roomName,
        callIdentifier,
        isFreeSession: hasFreeSession
      });
      
      callRequest.notificationSent = true;
      callRequest.notificationSentAt = new Date();
      await callRequest.save();
    }
    
    // Send response
    res.status(200).json({
      success: true,
      message: 'Call initiated successfully',
      data: {
        callRequestId: callRequest._id,
        callSessionId: activeSession._id,
        roomName,
        callIdentifier,
        token: userToken,
        psychic: {
          _id: psychic._id,
          name: psychic.name,
          image: psychic.image,
          ratePerMin: psychic.ratePerMin
        },
        expiresAt: callRequest.expiresAt,
        isFreeSession: hasFreeSession,
        timeRemaining: 30
      }
    });
    
  } catch (error) {
    console.error('❌ Error initiating call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call'
    });
  }
};

const acceptCall = async (req, res) => {
  try {
    console.log('📞 Accepting call request...');
    
    const { callRequestId } = req.params;
    const psychicId = req.user._id;
    
    console.log(`🎯 Psychic ${psychicId} accepting call request ${callRequestId}`);
    
    // Find call request
    const callRequest = await CallRequest.findById(callRequestId)
      .populate('userId', 'firstName lastName image email socketId')
      .populate('psychicId', 'name image bio socketId');
    
    if (!callRequest) {
      console.log(`❌ Call request ${callRequestId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Call request not found'
      });
    }
    
    // Verify psychic owns this request
    if (callRequest.psychicId._id.toString() !== psychicId.toString()) {
      console.log(`❌ Unauthorized: Psychic ${psychicId} does not own call request ${callRequestId}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this call'
      });
    }
    
    // Check if already responded
    if (callRequest.status !== 'pending') {
      console.log(`❌ Call request ${callRequestId} already in status: ${callRequest.status}`);
      return res.status(400).json({
        success: false,
        message: `Call request already ${callRequest.status}`
      });
    }
    
    // Check if expired
    const now = new Date();
    const expiresAt = new Date(callRequest.expiresAt);
    if (now > expiresAt) {
      console.log(`⏰ Call request ${callRequestId} expired at ${expiresAt}`);
      callRequest.status = 'expired';
      await callRequest.save();
      
      return res.status(400).json({
        success: false,
        message: 'Call request has expired'
      });
    }
    
    // Check if Twilio service is available
    if (!global.twilioService || !global.twilioService.isReady()) {
      console.error('❌ Twilio service not available or not ready!');
      return res.status(500).json({
        success: false,
        message: 'Audio service unavailable. Please try again.'
      });
    }
    
    // Find or create active session
    let activeSession = await ActiveCallSession.findOne({
      $or: [
        { callRequestId: callRequest._id },
        { 
          userId: callRequest.userId._id, 
          psychicId: callRequest.psychicId._id,
          status: 'initiated'
        }
      ]
    });
    
    let roomName;
    let roomSid;
    
    if (!activeSession) {
      console.log(`ℹ️ No active session found, creating new one...`);
      
      // Generate unique room name
      roomName = `audio_call_${Date.now()}_${callRequestId}`;
      
      try {
        // Create Twilio Video room for audio call
        const room = await global.twilioService.createAudioRoom(roomName);
        roomSid = room.sid;
        console.log(`✅ Created Twilio Video room: ${roomName} (SID: ${roomSid})`);
      } catch (error) {
        console.error('❌ Error creating Twilio room:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create audio room'
        });
      }
      
      // Create new active session
      activeSession = new ActiveCallSession({
        callRequestId: callRequest._id,
        userId: callRequest.userId._id,
        psychicId: callRequest.psychicId._id,
        roomName,
        roomSid,
        callIdentifier: roomName,
        status: 'initiated',
        startTime: new Date(),
        isAudioOnly: true
      });
    } else {
      roomName = activeSession.roomName;
      console.log(`ℹ️ Using existing session with room: ${roomName}`);
    }
    
    // ✅ GENERATE REAL TWILIO VIDEO TOKENS (NO DUMMY TOKENS!)
    let userToken;
    let psychicToken;
    
    try {
      // Generate Video tokens for audio-only call
      const tokens = global.twilioService.generateAudioCallTokens(
        callRequest.userId._id,
        psychicId,
        roomName
      );
      
      userToken = tokens.userToken;
      psychicToken = tokens.psychicToken;
      
      console.log(`✅ Generated Twilio Video tokens:`);
      console.log(`   User token length: ${userToken?.length}`);
      console.log(`   Psychic token length: ${psychicToken?.length}`);
      console.log(`   Room: ${roomName}`);
      
      // Validate tokens
      if (!userToken || !psychicToken) {
        throw new Error('Token generation failed');
      }
      
    } catch (tokenError) {
      console.error('❌ Error generating Twilio tokens:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate audio connection tokens'
      });
    }
    
    // Update call request
    callRequest.status = 'accepted';
    callRequest.respondedAt = new Date();
    callRequest.callSessionId = activeSession._id;
    await callRequest.save();
    console.log(`✅ Updated call request status to 'accepted'`);
    
    // Update active session
    activeSession.status = 'ringing';
    activeSession.startTime = new Date();
    activeSession.participantTokens = {
      user: userToken,
      psychic: psychicToken
    };
    
    // Add room name if not set
    if (!activeSession.roomName && roomName) {
      activeSession.roomName = roomName;
    }
    if (!activeSession.roomSid && roomSid) {
      activeSession.roomSid = roomSid;
    }
    
    await activeSession.save();
    console.log(`✅ Updated active session status to 'ringing'`);
    
    // Update psychic status
    await Psychic.findByIdAndUpdate(psychicId, {
      status: 'busy',
      lastActive: new Date()
    });
    console.log(`✅ Updated psychic ${psychicId} status to 'busy'`);
    
    // Prepare response data
    const psychicData = {
      _id: callRequest.psychicId._id,
      name: callRequest.psychicId.name,
      image: callRequest.psychicId.image,
      bio: callRequest.psychicId.bio,
      ratePerMin: callRequest.ratePerMin
    };
    
    const userData = {
      _id: callRequest.userId._id,
      firstName: callRequest.userId.firstName,
      lastName: callRequest.userId.lastName,
      image: callRequest.userId.image,
      email: callRequest.userId.email
    };
    
    // Send socket notification to user
    if (io) {
      const audioNamespace = io.of('/audio-calls');
      const userSocketId = callRequest.userId.socketId;
      
      const callAcceptedData = {
        callRequestId: callRequest._id,
        callSessionId: activeSession._id,
        roomName: activeSession.roomName,
        roomSid: activeSession.roomSid,
        token: userToken, // ✅ REAL VIDEO TOKEN
        psychic: psychicData,
        startTime: activeSession.startTime
      };
      
      if (userSocketId && audioNamespace) {
        audioNamespace.to(userSocketId).emit('call-accepted', callAcceptedData);
        console.log(`📢 Sent 'call-accepted' event to user ${callRequest.userId._id}`);
      } else {
        console.log(`⚠️  User ${callRequest.userId._id} not connected via socket, storing for later...`);
        // Store notification for when user reconnects
        await UserNotification.create({
          userId: callRequest.userId._id,
          type: 'call_accepted',
          data: callAcceptedData,
          read: false
        });
      }
    }
    
    // Send response to psychic (frontend)
    res.status(200).json({
      success: true,
      message: 'Call accepted successfully',
      data: {
        callRequestId: callRequest._id,
        callSessionId: activeSession._id,
        roomName: activeSession.roomName,
        roomSid: activeSession.roomSid,
        token: psychicToken, // ✅ REAL VIDEO TOKEN
        user: userData,
        startTime: activeSession.startTime,
        ratePerMin: callRequest.ratePerMin,
        creditsPerMin: callRequest.creditsPerMin
      }
    });
    
    console.log(`🎉 Call ${callRequestId} accepted successfully!`);
    console.log(`   Room: ${activeSession.roomName}`);
    console.log(`   User token sent: ${userToken ? 'Yes' : 'No'}`);
    console.log(`   Psychic token sent: ${psychicToken ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error accepting call:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to accept call',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
// Get specific call request by ID (for psychic) - SIMPLIFIED
const getCallRequestById = async (req, res) => {
  try {
    const { callRequestId } = req.params;
    
    console.log(`🔍 Fetching call request ${callRequestId}`);
    
    // Get token from anywhere
    const token = req.cookies?.token || 
                  req.headers.authorization?.split(' ')[1] || 
                  req.query.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }
    
    // Decode token
    const decoded = jwt.decode(token);
    
    // Find psychic by email
    const psychic = await Psychic.findOne({ 
      email: decoded?.email || 'ranazia943@gmail.com' 
    });
    
    if (!psychic) {
      return res.status(404).json({
        success: false,
        message: 'Psychic not found'
      });
    }
    
    // Find the call request
    const callRequest = await CallRequest.findById(callRequestId)
      .populate('userId', 'firstName lastName image email phone location credits rating totalSessions')
      .populate('psychicId', 'name image bio ratePerMin specialties status');

    if (!callRequest) {
      return res.status(404).json({
        success: false,
        message: 'Call request not found'
      });
    }

    // Verify psychic has access to this call request
    if (callRequest.psychicId._id.toString() !== psychic._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this call request'
      });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(callRequest.expiresAt);
    if (callRequest.status === 'pending' && now > expiresAt) {
      callRequest.status = 'expired';
      await callRequest.save();
    }

    // Get active session if exists
    const activeSession = await ActiveCallSession.findOne({
      callRequestId: callRequest._id,
      status: { $in: ['ringing', 'in-progress'] }
    }).select('_id status startTime roomName participantTokens');

    // Calculate time remaining if pending
    let timeRemaining = null;
    if (callRequest.status === 'pending' && callRequest.expiresAt) {
      timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
    }

    // Prepare response data
    const responseData = {
      ...callRequest.toObject(),
      timeRemaining,
      activeSession,
      isExpired: callRequest.status === 'expired',
      canAccept: callRequest.status === 'pending' && timeRemaining > 0
    };

    res.status(200).json({
      success: true,
      message: 'Call request fetched successfully',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error fetching call request by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call request',
      error: error.message
    });
  }
};

const getCallWithDetails = async (req, res) => {
  try {
    const { callRequestId } = req.params;
    const psychicId = req.user._id;
    
    console.log(`🔍 Fetching detailed call request ${callRequestId} for psychic ${psychicId}`);
    
    // Find call request
    const callRequest = await CallRequest.findById(callRequestId)
      .populate('userId', 'firstName lastName image email phone')
      .populate('psychicId', 'name image bio ratePerMin');

    if (!callRequest) {
      return res.status(404).json({
        success: false,
        message: 'Call request not found'
      });
    }

    // Check authorization
    if (callRequest.psychicId._id.toString() !== psychicId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Check if expired (even if status is still pending)
    const now = new Date();
    let timeRemaining = 0;
    let isExpired = false;
    
    if (callRequest.expiresAt) {
      const expiresAt = new Date(callRequest.expiresAt);
      timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      isExpired = timeRemaining === 0;
      
      // Auto-update status if expired
      if (isExpired && callRequest.status === 'pending') {
        callRequest.status = 'expired';
        await callRequest.save();
        console.log(`⚠️  Auto-updated call ${callRequestId} to expired`);
      }
    }

    // Get active session if exists
    const activeSession = await ActiveCallSession.findOne({
      $or: [
        { callRequestId: callRequest._id },
        { userId: callRequest.userId._id, psychicId: callRequest.psychicId._id }
      ],
      status: { $in: ['ringing', 'in-progress'] }
    }).select('_id status startTime roomName participantTokens');

    // Prepare response data
    const responseData = {
      callRequest: {
        _id: callRequest._id,
        status: callRequest.status,
        requestedAt: callRequest.requestedAt,
        expiresAt: callRequest.expiresAt,
        ratePerMin: callRequest.ratePerMin,
        creditsPerMin: callRequest.creditsPerMin,
        userCreditsAtRequest: callRequest.userCreditsAtRequest,
        timeRemaining,
        isExpired
      },
      user: callRequest.userId,
      psychic: callRequest.psychicId,
      activeSession,
      canAccept: callRequest.status === 'pending' && timeRemaining > 0 && !activeSession,
      canJoin: activeSession && activeSession.status === 'ringing'
    };

    console.log(`✅ Call details fetched:`, {
      status: responseData.callRequest.status,
      timeRemaining,
      canAccept: responseData.canAccept,
      hasActiveSession: !!activeSession
    });

    res.status(200).json({
      success: true,
      message: 'Call details fetched successfully',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error fetching call details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call details',
      error: error.message
    });
  }
};
// Accept a call request - SIMPLIFIED (no middleware)


// Reject a call request - SIMPLIFIED (no middleware)
const rejectCall = async (req, res) => {
  try {
    console.log('❌ Rejecting call request...');
    
    const { callRequestId } = req.params;
    const { reason } = req.body;
    
    // Get token from anywhere
    const token = req.cookies?.token || 
                  req.headers.authorization?.split(' ')[1] || 
                  req.query.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }
    
    // Decode token to get psychic info
    const decoded = jwt.decode(token);
    
    // Find psychic by email
    const psychic = await Psychic.findOne({ 
      email: decoded?.email || 'ranazia943@gmail.com' 
    });
    
    if (!psychic) {
      return res.status(404).json({
        success: false,
        message: 'Psychic not found'
      });
    }
    
    const psychicId = psychic._id;
    
    // Find call request
    const callRequest = await CallRequest.findById(callRequestId)
      .populate('userId');
    
    if (!callRequest) {
      return res.status(404).json({
        success: false,
        message: 'Call request not found'
      });
    }
    
    // Verify psychic owns this request
    if (callRequest.psychicId.toString() !== psychicId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this call'
      });
    }
    
    // Update call request
    callRequest.status = 'rejected';
    callRequest.rejectionReason = reason || 'No reason provided';
    callRequest.respondedAt = new Date();
    await callRequest.save();
    
    // Find and update active session
    await ActiveCallSession.findOneAndUpdate({
      userId: callRequest.userId,
      psychicId: callRequest.psychicId,
      status: 'initiated'
    }, {
      status: 'rejected',
      endReason: 'psychic_rejected',
      endTime: new Date()
    }, { new: true });
    
    // Update psychic status
    await Psychic.findByIdAndUpdate(psychicId, {
      status: 'online',
      lastActive: new Date()
    });
    
    // Notify user via socket if available
    if (io) {
      const audioNamespace = io.of('/audio-calls');
      const userSocketId = callRequest.userId.socketId;
      
      if (userSocketId && audioNamespace) {
        audioNamespace.to(userSocketId).emit('call-rejected', {
          callRequestId: callRequest._id,
          reason: reason || 'Psychic rejected the call',
          psychicId
        });
        console.log('✅ Sent call-rejected socket event to user');
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Call rejected successfully',
      rejectionReason: reason || 'No reason provided'
    });
    
  } catch (error) {
    console.error('❌ Error rejecting call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject call',
      error: error.message
    });
  }
};



// 4. Cancel Call (User)
const cancelCall = async (req, res) => {
  try {
    const { callRequestId } = req.params;
    const userId = req.user._id;
    
    // Find call request
    const callRequest = await CallRequest.findById(callRequestId)
      .populate('psychicId');
    
    if (!callRequest) {
      return res.status(404).json({
        success: false,
        message: 'Call request not found'
      });
    }
    
    // Verify user owns this request
    if (callRequest.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this call'
      });
    }
    
    // Update call request
    callRequest.status = 'cancelled';
    callRequest.respondedAt = new Date();
    await callRequest.save();
    
    // Find and update active session
    const activeSession = await ActiveCallSession.findOneAndUpdate({
      userId: callRequest.userId,
      psychicId: callRequest.psychicId,
      status: { $in: ['initiated', 'ringing'] }
    }, {
      status: 'ended',
      endReason: 'user_cancelled',
      endTime: new Date()
    });
    
    // Update psychic status if they were busy
    if (callRequest.psychicId) {
      await Psychic.findByIdAndUpdate(callRequest.psychicId._id, {
        status: 'online',
        lastActive: new Date()
      });
    }
    
    // Notify psychic via socket
    const audioNamespace = io.of('/audio-calls');
    const psychicSocketId = callRequest.psychicId.socketId;
    
    if (psychicSocketId && audioNamespace) {
      audioNamespace.to(psychicSocketId).emit('call-cancelled', {
        callRequestId: callRequest._id,
        userId
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Call cancelled'
    });
    
  } catch (error) {
    console.error('Error cancelling call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel call',
      error: error.message
    });
  }
};


// Remove the io import from top and pass it as parameter
const endCall = async (req, res) => {
  try {
    const { callSessionId } = req.params;
    const { endReason } = req.body;
    const userId = req.user._id;
    
    console.log(`📞 Ending call session: ${callSessionId}, user: ${userId}`);
    
    // Find active session
    const activeSession = await ActiveCallSession.findById(callSessionId)
      .populate('userId')
      .populate('psychicId');
    
    if (!activeSession) {
      return res.status(404).json({
        success: false,
        message: 'Call session not found'
      });
    }
    
    // Verify user is part of this session
    const isUser = activeSession.userId._id.toString() === userId.toString();
    const isPsychic = activeSession.psychicId._id.toString() === userId.toString();
    
    if (!isUser && !isPsychic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this call'
      });
    }
    
    // Calculate duration
    const endTime = new Date();
    let durationSeconds = 0;
    
    if (activeSession.startTime) {
      durationSeconds = Math.floor((endTime - activeSession.startTime) / 1000);
      console.log(`⏱️ Call duration: ${durationSeconds} seconds`);
    }
    
    // Calculate credits used
    const minutesUsed = Math.ceil(durationSeconds / 60);
    const creditsUsed = minutesUsed * activeSession.creditsPerMin;
    
    // Mark free session as used if applicable
    if (activeSession.isFreeSession && durationSeconds > 0) {
      await User.findByIdAndUpdate(activeSession.userId._id, {
        hasUsedFreeAudioMinute: true
      });
      console.log(`⭐ Marked free session as used for user: ${activeSession.userId._id}`);
    }
    
    // Archive to CallSession
    const archivedSession = new CallSession({
      callSid: activeSession._id.toString(),
      roomName: activeSession.roomName,
      roomSid: activeSession.twilioRoomSid,
      userId: activeSession.userId._id,
      psychicId: activeSession.psychicId._id,
      status: 'completed',
      endReason: endReason || (isUser ? 'ended_by_user' : 'ended_by_psychic'),
      startTime: activeSession.startTime,
      endTime,
      durationSeconds,
      ratePerMin: activeSession.ratePerMin,
      creditsPerMin: activeSession.creditsPerMin,
      totalCreditsUsed: creditsUsed,
      userPlatform: activeSession.userPlatform,
      psychicPlatform: activeSession.psychicPlatform
    });
    
    await archivedSession.save();
    console.log(`📁 Archived call session: ${archivedSession._id}`);
    
    // Delete active session
    await ActiveCallSession.deleteOne({ _id: callSessionId });
    console.log(`🗑️ Deleted active session: ${callSessionId}`);
    
    // Update psychic status
    await Psychic.findByIdAndUpdate(activeSession.psychicId._id, {
      status: 'online',
      lastActive: new Date()
    });
    console.log(`👤 Updated psychic ${activeSession.psychicId._id} status to online`);
    
    // Get io from app (injected via middleware)
    const io = req.app.get('io'); // Assuming you set io on app
    
    // Notify both participants via socket if io is available
    if (io) {
      const audioNamespace = io.of('/audio-calls');
      
      console.log(`🔔 Notifying participants about ended call`);
      
      // Notify user
      if (activeSession.userId.socketId) {
        audioNamespace.to(activeSession.userId.socketId).emit('call-ended', {
          callSessionId: activeSession._id,
          duration: durationSeconds,
          creditsUsed,
          endReason: endReason || 'ended_by_user'
        });
        console.log(`👤 Notified user: ${activeSession.userId._id}`);
      }
      
      // Notify psychic
      if (activeSession.psychicId.socketId) {
        audioNamespace.to(activeSession.psychicId.socketId).emit('call-ended', {
          callSessionId: activeSession._id,
          duration: durationSeconds,
          endReason: endReason || 'ended_by_user'
        });
        console.log(`🔮 Notified psychic: ${activeSession.psychicId._id}`);
      }
    } else {
      console.log('⚠️ Socket.IO not available for notifications');
    }
    
    res.status(200).json({
      success: true,
      message: 'Call ended successfully',
      data: {
        callSessionId: activeSession._id,
        duration: durationSeconds,
        creditsUsed,
        endReason: endReason || 'ended_by_user'
      }
    });
    
  } catch (error) {
    console.error('❌ Error ending call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end call',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 6. Get Call Status
const getCallStatus = async (req, res) => {
  try {
    const { callSessionId } = req.params;
    const userId = req.user._id;
    
    // Find active session
    const activeSession = await ActiveCallSession.findById(callSessionId)
      .populate('psychicId', 'name image bio ratePerMin')
      .populate('userId', 'firstName lastName image');
    
    if (!activeSession) {
      // Check archived sessions
      const archivedSession = await CallSession.findById(callSessionId)
        .populate('psychicId', 'name image')
        .populate('userId', 'firstName lastName');
      
      if (!archivedSession) {
        return res.status(404).json({
          success: false,
          message: 'Call session not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          ...archivedSession.toObject(),
          isArchived: true
        }
      });
    }
    
    // Verify user is part of this session
    if (activeSession.userId._id.toString() !== userId.toString() && 
        activeSession.psychicId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this call'
      });
    }
    
    // Calculate elapsed time if call is active
    let elapsedSeconds = 0;
    if (activeSession.startTime && activeSession.status === 'in-progress') {
      elapsedSeconds = Math.floor((new Date() - activeSession.startTime) / 1000);
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...activeSession.toObject(),
        elapsedSeconds,
        isActive: activeSession.status === 'in-progress'
      }
    });
    
  } catch (error) {
    console.error('Error getting call status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call status',
      error: error.message
    });
  }
};

// 7. Get User's Call History
const getUserCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Get archived calls
    const [calls, total] = await Promise.all([
      CallSession.find({ userId })
        .populate('psychicId', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CallSession.countDocuments({ userId })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        calls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting call history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call history',
      error: error.message
    });
  }
};

// 8. Get Psychic's Call History
// In callController.js - Simplified psychic call history
// In callController.js - Verify this function exists
const getPsychicCallHistory = async (req, res) => {
  try {
    console.log('📋 Getting psychic call history for:', req.user.name);
    
    const psychicId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    console.log('Query params:', { page, limit, skip });
    
    // Get archived calls from CallSession
    const [calls, total] = await Promise.all([
      CallSession.find({ psychicId })
        .populate('userId', 'firstName lastName image email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CallSession.countDocuments({ psychicId })
    ]);
    
    console.log(`Found ${calls.length} call history records out of ${total} total`);
    
    // Format the response
    const formattedCalls = calls.map(call => ({
      ...call,
      durationFormatted: formatDuration(call.durationSeconds),
      earnings: ((call.durationSeconds || 0) / 60 * (call.ratePerMin || 0)).toFixed(2),
      dateFormatted: new Date(call.createdAt).toLocaleDateString()
    }));
    
    res.status(200).json({
      success: true,
      message: `Found ${total} call${total !== 1 ? 's' : ''} in history`,
      data: {
        calls: formattedCalls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting psychic call history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call history',
      error: error.message
    });
  }
};

// Helper function
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 9. Twilio Webhook Handler
const twilioWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log('Twilio webhook received:', event.EventType);
    
    // Handle room events
    if (event.EventType === 'room-created') {
      const { RoomSid, RoomName } = event;
      
      // Update active session with room SID
      await ActiveCallSession.findOneAndUpdate(
        { roomName: RoomName },
        { twilioRoomSid: RoomSid }
      );
    }
    
    // Handle participant events
    if (event.EventType === 'participant-connected') {
      const { RoomSid, ParticipantSid, ParticipantIdentity } = event;
      
      // Find session by room SID
      const session = await ActiveCallSession.findOne({ twilioRoomSid: RoomSid });
      
      if (session && !session.startTime) {
        session.status = 'in-progress';
        session.startTime = new Date();
        session.lastChargeTime = new Date();
        await session.save();
        
        // Start timer for billing
        const audioNamespace = io.of('/audio-calls');
        
        // Notify user
        if (session.userId.socketId) {
          audioNamespace.to(session.userId.socketId).emit('call-joined', {
            callSessionId: session._id,
            startTime: session.startTime
          });
        }
        
        // Notify psychic
        if (session.psychicId.socketId) {
          audioNamespace.to(session.psychicId.socketId).emit('call-joined', {
            callSessionId: session._id,
            startTime: session.startTime
          });
        }
      }
    }
    
    // Handle recording events
    if (event.EventType === 'recording-completed') {
      const { RoomSid, RecordingSid, RecordingUrl } = event;
      
      // Update session with recording info
      await ActiveCallSession.findOneAndUpdate(
        { twilioRoomSid: RoomSid },
        { recordingSid: RecordingSid, recordingUrl: RecordingUrl }
      );
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error in Twilio webhook:', error);
    res.status(500).send('Error');
  }
};

// 10. Get Active Call for User
const getActiveCall = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const activeCall = await ActiveCallSession.findOne({
      userId,
      status: { $in: ['initiated', 'ringing', 'in-progress'] }
    })
    .populate('psychicId', 'name image bio ratePerMin')
    .populate('userId', 'firstName lastName image');
    
    if (!activeCall) {
      return res.status(404).json({
        success: false,
        message: 'No active call found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: activeCall
    });
    
  } catch (error) {
    console.error('Error getting active call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active call',
      error: error.message
    });
  }
};

// Add this to your callController.js
const getPsychicActiveCall = async (req, res) => {
  try {
    const psychicId = req.user._id;
    
    const activeCall = await ActiveCallSession.findOne({
      psychicId,
      status: { $in: ['ringing', 'in-progress'] }
    })
    .populate('userId', 'firstName lastName image')
    .sort({ startTime: -1 });
    
    if (!activeCall) {
      return res.status(404).json({
        success: false,
        message: 'No active call found'
      });
    }
    
    // Also check for pending call requests
    const pendingRequest = await CallRequest.findOne({
      psychicId,
      status: 'pending'
    })
    .populate('userId', 'firstName lastName image')
    .sort({ requestedAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        ...activeCall.toObject(),
        callRequestId: pendingRequest?._id || activeCall.callRequestId
      }
    });
    
  } catch (error) {
    console.error('Error getting psychic active call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active call',
      error: error.message
    });
  }
};



// Add to routes
// In pendingController.js - UPDATED VERSION
const getPsychicPendingCalls = async (req, res) => {
  try {
    console.log('📞 [PENDING CONTROLLER] Getting pending calls...');
    console.log('Psychic:', req.user.name, 'ID:', req.user._id);
    
    if (!req.user || !req.user._id) {
      console.log('❌ No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const psychicId = req.user._id;
    
    // TEMPORARY: Remove expiresAt filter to see all pending calls
    const query = {
      psychicId,
      status: 'pending'
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    // Get pending calls WITHOUT expiresAt filter for now
    const pendingCalls = await CallRequest.find(query)
      .populate('userId', 'firstName lastName image email phone')
      .sort({ requestedAt: -1 })
      .lean();
    
    console.log(`✅ Found ${pendingCalls.length} pending calls in database`);
    
    if (pendingCalls.length === 0) {
      console.log('ℹ️ No pending calls found');
      return res.status(200).json({
        success: true,
        message: 'No pending calls',
        count: 0,
        data: [],
        psychic: {
          id: req.user._id,
          name: req.user.name,
          isVerified: req.user.isVerified
        }
      });
    }
    
    // Filter out expired calls manually
    const now = new Date();
    const validCalls = pendingCalls.filter(call => {
      if (!call.expiresAt) {
        console.log(`Call ${call._id} has no expiresAt field - including it`);
        return true;
      }
      
      const expiresAt = new Date(call.expiresAt);
      const isExpired = expiresAt <= now;
      
      if (isExpired) {
        console.log(`Call ${call._id} expired at ${expiresAt}`);
        // Update status to expired in database
        CallRequest.findByIdAndUpdate(call._id, { status: 'expired' }).catch(err => {
          console.error('Error updating expired call:', err);
        });
        return false;
      }
      
      return true;
    });
    
    console.log(`✅ ${validCalls.length} valid (non-expired) pending calls`);
    
    // Add time remaining for each call
    const callsWithTimeRemaining = validCalls.map(call => {
      let timeRemaining = null;
      
      if (call.expiresAt) {
        const expiresAt = new Date(call.expiresAt);
        timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      }
      
      return {
        ...call,
        timeRemaining,
        expiresAt: call.expiresAt ? new Date(call.expiresAt).toISOString() : null,
        requestedAt: new Date(call.requestedAt).toISOString(),
        _id: call._id.toString() // Ensure _id is string
      };
    });
    
    res.status(200).json({
      success: true,
      message: `Found ${callsWithTimeRemaining.length} pending call${callsWithTimeRemaining.length !== 1 ? 's' : ''}`,
      count: callsWithTimeRemaining.length,
      data: callsWithTimeRemaining,
      psychic: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isVerified: req.user.isVerified
      }
    });
    
  } catch (error) {
    console.error('❌ Error in getPsychicPendingCalls:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending calls',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


module.exports = {
  setSocketIO,
  setTwilioService,
  initiateCall,
  acceptCall,
  rejectCall,
  cancelCall,
  endCall,
  getCallStatus,
  getUserCallHistory,
  getPsychicCallHistory,
  twilioWebhook,
  getActiveCall,
  getPsychicPendingCalls,
  getPsychicActiveCall,
  getCallRequestById, // Add this
  getCallWithDetails  // Add this if you want the detailed version
};