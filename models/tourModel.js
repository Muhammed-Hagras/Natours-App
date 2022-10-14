const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, `A tour must have a name`],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name must have less than 40 charaters'],
      minlength: [10, 'Tour name must have more than 10 charaters'],
    },
    duration: {
      type: Number,
      required: [true, `A tour must have a duraion`],
    },
    maxGroupSize: {
      type: Number,
      required: [true, `A tour must have a maxGroupSize`],
    },
    difficulty: {
      type: String,
      required: [true, `A tour must have a  difficulty`],
      enum: {
        values: ['difficult', 'medium', 'easy'],
        message: 'Diffivuly should be only difficult, medium or easy',
      },
    },
    ratingaverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Tour ratingaverage must be above 1.0'],
      max: [5, 'Tour ratingaverage must  be below 5.0'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, `A tour must have a price`],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //This only points to current doc on new creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, `A tour must have a summary`],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, `A tour must have a imageCover`],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Doc Middleware before save(), create()
tourSchema.pre('save', function (next) {
  // eslint-disable-next-line new-cap
  this.slug = new slugify(this.name, { lower: true });
  next();
});

//Doc Middleware after save(), create()
tourSchema.post('save', (doc, next) => {
  console.log(doc);
  next();
});

//Query Middleware before all find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//Query Middleware after all find
tourSchema.post(/^find/, function (docs, next) {
  console.log(`query takes ${Date.now() - this.start} Milliseconds`);
  next();
});

//AggregateMiddleware before aggregate
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model(`Tour`, tourSchema);

module.exports = Tour;
