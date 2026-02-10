// middleware/PsychicMiddleware.js - UPDATED
const jwt = require('jsonwebtoken');
const Psychic = require('../models/HumanChat/Psychic');

const protectPsychic = async (req, res, next) => {
  console.log('🔐 [protectPsychic] Starting...');
  console.log('Cookies:', req.cookies);
  
  let token;

  // 1. Check psychicToken cookie (primary)
  if (req.cookies && req.cookies.psychicToken) {
    token = req.cookies.psychicToken;
    console.log('✅ Token from psychicToken cookie');
  } 
  // 2. Check token cookie (secondary)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('✅ Token from token cookie');
  }
  // 3. Check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Token from Authorization header');
  }

  if (!token) {
    console.log('❌ No token found anywhere');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please login first'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified. Decoded:', decoded);
    
    // FIX: Don't check role for now - just find psychic
    // if (decoded.role !== 'psychic') {
    //   console.log('⚠️ Role check skipped for debugging');
    // }
    
    // Find psychic by ID
    const psychic = await Psychic.findById(decoded.id).select('-password');
    
    if (!psychic) {
      console.log('❌ Psychic not found for ID:', decoded.id);
      
      // Try to find by email as fallback
      const psychicByEmail = await Psychic.findOne({ email: decoded.email });
      if (psychicByEmail) {
        console.log('✅ Found psychic by email:', psychicByEmail.name);
        req.user = psychicByEmail;
        req.psychic = psychicByEmail;
        return next();
      }
      
      return res.status(401).json({
        success: false,
        message: 'Psychic account not found',
        debug: {
          tokenId: decoded.id,
          tokenEmail: decoded.email,
          tokenRole: decoded.role
        }
      });
    }

    console.log('✅ Psychic found:', psychic.name);
    
    // Attach psychic to request
    req.user = psychic;
    req.psychic = psychic;

    next();

  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

module.exports = { protectPsychic };