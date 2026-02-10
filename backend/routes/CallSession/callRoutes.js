const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { protectPsychic } = require('../../middleware/PsychicMiddleware');
const {
  initiateCall,
  acceptCall,
  rejectCall,
  cancelCall,
  endCall,
  getCallStatus,
  getCallRequestById,
  getCallWithDetails,
  getUserCallHistory,
  getPsychicCallHistory,
  getPsychicActiveCall,
  getActiveCall,
  getPsychicPendingCalls
} = require('../../controllers/CallSession/callController');
// Add this to your callRoutes.js
const jwt = require('jsonwebtoken');

// Debug endpoint to check token
router.get('/debug-token', (req, res) => {
  try {
    let token;
    
    // Check cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token from cookie');
    } 
    // Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token from header');
    }
    // Check psychicToken cookie
    else if (req.cookies && req.cookies.psychicToken) {
      token = req.cookies.psychicToken;
      console.log('Token from psychicToken cookie');
    }
    
    if (!token) {
      return res.json({
        success: false,
        message: 'No token found',
        cookies: req.cookies,
        headers: req.headers
      });
    }
    
    // Decode token
    const decoded = jwt.decode(token);
    console.log('Decoded token:', decoded);
    
    res.json({
      success: true,
      tokenInfo: {
        decoded,
        role: decoded?.role,
        isRolePsychic: decoded?.role === 'psychic',
        id: decoded?.id,
        email: decoded?.email
      },
      cookieNames: Object.keys(req.cookies || {})
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
// User routes (protected)
router.post('/initiate/:psychicId', protect, initiateCall);
router.post('/cancel/:callRequestId', protect, cancelCall);
router.post('/end/:callSessionId', protect, endCall);
router.get('/status/:callSessionId', protect, getCallStatus);
router.get('/active', protect, getActiveCall);
router.get('/history', protect, getUserCallHistory);

// Psychic routes (protected)
router.get('/pending', protectPsychic, getPsychicPendingCalls);

router.get('/request/:callRequestId', protectPsychic, getCallRequestById); // ADD THIS LINE
router.get('/details/:callRequestId', protectPsychic, getCallWithDetails);

router.post('/accept/:callRequestId', protectPsychic, acceptCall);
router.post('/reject/:callRequestId', protectPsychic, rejectCall);
router.get('/psychic/active', protectPsychic, getPsychicActiveCall);

router.get('/psychic/history', protectPsychic, getPsychicCallHistory);

module.exports = router;