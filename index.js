// index.js (or app.js)
const express = require('express');
const cors = require('cors');
const config = require('config');
const app = express();

// Initialize logging and database connection
const db = require('./startup/db');
const logging = require('./startup/logging');
logging(); // Initialize logging
db(); // Initialize the database connection

// CORS configuration
app.use(cors({
  exposedHeaders: ['x-auth-token']
}));

// Middleware
app.use(express.json()); // Middleware to parse JSON

// Import and use routes
const users = require('./routes/users');
const movies = require('./routes/movies');
const genres = require('./routes/genres');
const auth = require('./routes/auth'); // Import the auth route

app.use('/api/users', users);
app.use('/api/movies', movies);
app.use('/api/genres', genres);
app.use('/api/auth', auth); // Use the auth route

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).send('Internal Server Error');
});

const port = config.get('port');
app.listen(port, () => console.log(`Listening on port ${port}...`));
