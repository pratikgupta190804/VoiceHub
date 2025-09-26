const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.checkUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        message: "Unauthorized - No authentication token found",
        error: "NO_TOKEN"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ 
        message: "Unauthorized - Invalid token",
        error: "INVALID_TOKEN"
      });
    }

    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        message: "Unauthorized - User not found",
        error: "USER_NOT_FOUND"
      });
    }

    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Unauthorized - Invalid token format",
        error: "MALFORMED_TOKEN"
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Unauthorized - Token expired",
        error: "TOKEN_EXPIRED"
      });
    }
    
    console.error('Authentication error:', error.message);
    res.status(500).json({ 
      message: "Internal Server Error during authentication",
      error: "AUTH_ERROR"
    });
  }
};
