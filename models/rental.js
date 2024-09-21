const Joi = require('joi');

const moment = require('moment');
// routes/rentals.js
const mongoose = require('mongoose');
const Fawn = require('fawn');

// Ensure mongoose is connected
mongoose.connect('mongodb://localhost:27017/vidly')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Initialize Fawn with the correct mongoose instance
Fawn.init(mongoose);

const rentalSchema = new mongoose.Schema({
  customer: { 
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      },
      isGold: {
        type: Boolean,
        default: false
      },
      phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      }      
    }),  
    required: true
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true, 
        minlength: 5,
        maxlength: 255
      },
      dailyRentalRate: { 
        type: Number, 
        required: true,
        min: 0,
        max: 255
      }   
    }),
    required: true
  },
  dateOut: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  dateReturned: { 
    type: Date
  },
  rentalFee: { 
    type: Number, 
    min: 0
  }
});

rentalSchema.statics.lookup = function(customerId, movieId) {
  return this.findOne({
    'customer._id': customerId,
    'movie._id': movieId,
  });
}

rentalSchema.methods.return = function() {
  this.dateReturned = new Date();

  const rentalDays = moment().diff(this.dateOut, 'days');
  this.rentalFee = rentalDays * this.movie.dailyRentalRate;
}

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental; 
exports.validate = validateRental;