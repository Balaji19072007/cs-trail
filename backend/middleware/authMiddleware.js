const jwt = require('jsonwebtoken');

/**
 * @desc    Auth Middleware - Verify JWT Token
 * @access  Protected Routes
 */
module.exports = function (req, res, next) {
  // Get token from multiple possible sources
  const token = req.header('x-auth-token') || 
                req.header('Authorization')?.replace('Bearer ', '') ||
                req.query.token;

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      msg: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token has the expected structure
    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({
        success: false,
        msg: 'Invalid token structure',
        code: 'INVALID_TOKEN_STRUCTURE'
      });
    }

    // Add user from payload to request object
    req.user = decoded.user;
    
    // Add token to request for potential use in controllers
    req.token = token;
    
    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Token expired, please sign in again',
        code: 'TOKEN_EXPIRED',
        expiredAt: err.expiredAt
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (err.name === 'NotBeforeError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Token not active',
        code: 'TOKEN_NOT_ACTIVE',
        date: err.date
      });
    }

    // Generic error
    console.error('JWT Verification Error:', err.message);
    res.status(401).json({ 
      success: false,
      msg: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};