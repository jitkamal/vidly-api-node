// models/movie.js
const mongoose = require('mongoose');
const Joi = require('joi');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  genre: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      }
    }),
    required: true
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  publishDate: {
    type: Date,
    default: Date.now
  }
});

const Movie = mongoose.model('Movie', movieSchema);

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    genreId: Joi.string().required(),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required()
  });

  return schema.validate(movie);
}

exports.Movie = Movie;
exports.validate = validateMovie;
