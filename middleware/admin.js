const { authenticate } = require('./auth'); // Make sure the path is correct

module.exports = function(req, res, next) {
  // Ensure the user is authenticated
  authenticate(req, res, () => {
    // Check if the user has an admin role
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  });
};
