// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const Joi = require('joi');
const config = require('config'); // Import config for JWT secret

const router = express.Router();

// POST /api/auth - Authenticate a user and return a token
router.post('/', async (req, res) => {
  debugger
  try {
    // Validate the request body
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if the user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    // Validate the password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });

    // Generate the JWT token after successful authentication
    const token = jwt.sign(
      { _id: user._id, role: user.role }, // Payload with user ID and role
      config.get('jwtPrivateKey'), // Use the private key from config
      { expiresIn: '1h' } // Token expiration time
    );

    // Set custom headers and send response with token
    res.header('x-auth-token', token)
      .header('access-control-expose-headers', 'x-auth-token')
      .status(200)
      .json({
        _id: user._id,
        email: user.email,
        name: user.name,
        role:user.role,
        token // Return the token in the response body as well
      });
  } catch (err) {
    console.error('Internal Server Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Joi validation for login request
function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(req);
}

module.exports = router;
