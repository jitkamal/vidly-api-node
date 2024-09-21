const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const bcrypt = require('bcrypt');

// Define the user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Define possible roles
    default: 'user' // Default role
  }
});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate auth token
userSchema.methods.generateAuthToken = function() {
  // Include _id, email, name, and role in the payload
  const token = jwt.sign(
    { _id: this._id, email: this.email, name: this.name, role: this.role }, // Include role
    config.get('jwtPrivateKey'), // Secret key from config
    { expiresIn: '1h' } // Token expires in 1 hour
  );
  return token;
};

const User = mongoose.model('User', userSchema);

// Function to validate user input
function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
    name: Joi.string().optional(),
    role: Joi.string().valid('user', 'admin').optional() // Validate role
  });
  return schema.validate(user);
}

module.exports = { User, validateUser };
