const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

const db = config.get('db'); // Get the database URL from the config

module.exports = function() {
  mongoose.connect(db) // Removed deprecated options
    .then(() => {
      winston.info(`Connected to ${db}...`);
    })
    .catch(err => {
      winston.error('Could not connect to MongoDB...', err);
      process.exit(1); // Exit the process if connection fails
    });
};
