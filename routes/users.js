const express = require('express');
const router = express.Router();
const { User, validateUser } = require('../models/user');  // Import both User and validateUser

// POST request to create a new user
router.post('/', async (req, res) => {
  try {
    console.log('Request received:', req.body);

    // Validate user input
    const { error } = validateUser(req.body);
    if (error) {
      console.error('Validation error:', error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }

    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      console.error('User already registered:', req.body.email);
      return res.status(400).send('User already registered.');
    }

    // Create new user
    user = new User({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      role: req.body.role || 'user'  // Set role if provided or default to 'user'
    });

    await user.save();

    // Generate auth token
    const token = user.generateAuthToken();
    
    res.header("x-auth-token", token)
       .header("access-control-expose-headers", "x-auth-token")
       .status(201)
       .send({
         _id: user._id,
         email: user.email,
         name: user.name,
         role: user.role,  // Include role in response
         token
       });
  } catch (err) {
    console.error('Internal Server Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
