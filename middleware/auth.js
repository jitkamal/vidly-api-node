const jwt = require('jsonwebtoken');
const config = require('config'); // Use config package to get configuration settings

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  if (!config.get('requiresAuth')) return next(); // Skip authentication if not required

  const token = req.header('x-auth-token');
  
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, config.get('jwtPrivateKey'), (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });

    req.user = decoded;
    next();
  });
};

// Middleware to authorize user based on role
const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (!config.get('requiresAuth')) return next(); // Skip authorization if not required

    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden: Insufficient rights.' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
