// routes/movies.js
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const { authenticate, authorize } = require('../middleware/auth'); // Updated import
const validateObjectId = require('../middleware/validateObjectId');
const moment = require('moment');
const express = require('express');
const router = express.Router();

// GET all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find()
      .select('-__v')
      .sort('title');
    res.send(movies);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// POST a new movie (requires authentication)
router.post('/', [authenticate, authorize('admin')], async (req, res) => { // Added authorize middleware
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
    publishDate: moment().toJSON()
  });

  try {
    await movie.save();
    res.send(movie);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// PUT (update) a movie (requires authentication)
router.put('/:id', [authenticate, authorize('admin')], async (req, res) => { // Added authorize middleware
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    },
    { new: true }
  );

  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

// DELETE a movie (requires authentication)
router.delete('/:id', [authenticate, authorize('admin')], async (req, res) => { // Added authorize middleware
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id); // Updated method
    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
    res.send(movie);
  } catch (error) {
    res.status(500).send('Something went wrong.');
  }
});

// GET a single movie by ID
router.get('/:id', validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id).select('-__v');

  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

module.exports = router;
