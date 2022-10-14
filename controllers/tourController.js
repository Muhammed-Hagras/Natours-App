const Tour = require(`./../models/tourModel`);
const APIFeatures = require(`./../utiles/apiFeatures`);
const catchAsync = require('../utiles/catchAsync');
const AppError = require('../utiles/appError');

// const fs = require('fs');

// const tours = JSON.parse(fs.readFileSync('dev-data/data/tours-simple.json'));

// const checkID = (req, res, next, val) => {
//   console.log(`The tour id is ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       msg: 'Invalid ID',
//     });
//   }

//   next();
// };

//Route Handler

const aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingaverage,price';
  req.query.fileds = 'name, price, ratingaverage, summary, difficulty';

  next();
};

//Get All Tours
const getAllTours = catchAsync(async (req, res) => {
  //Build Query
  // 1A) Filtering
  // const queryObj = { ...req.query };
  // const excludedFields = ['limit', 'sort', 'page', 'fields'];
  // excludedFields.forEach((el) => delete queryObj[el]);

  // 1B) Advanced Filtering
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  // let query = Tour.find(JSON.parse(queryStr));

  // // 2) Sorting
  // if (req.query.sort) {
  //   const sortedBy = req.query.sort.split(',').join(' ');

  //   query = query.sort(sortedBy);
  // } else {
  //   query = query.sort('createdAt');
  // }

  // //3)Field Limitation
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v -_id');
  // }

  // //4) Pagination
  // const page = req.query.page * 1 || 1; // *1 = string => number
  // const limit = req.query.limit * 1 || 100;
  // const skipVal = (page - 1) * limit; //Page 1 = 1:10, page 2 = 11: 20, page 3 = 21:30

  // query = query.skip(skipVal).limit(limit);

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skipVal >= numTours) throw new Error('This page does not exist');
  // }

  const features = new APIFeatures(Tour.find(), req.query)
    .filetr()
    .sort()
    .fieldlimition()
    .pagination();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getStatistics = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingaverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingaverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

const getMonthPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});

//Get Tour using id
const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//Update Tour using id
const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//Delete Tour using id
const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with ID', 404));
  }
  res.status(200).json({
    status: 'success',
  });
});

//Create Tour
const creatTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      tour: newTour,
    },
  });

  // try {
  //   const newTour = await Tour.create(req.body);
  //   res.status(201).json({
  //     status: 'Success',
  //     data: {
  //       tour: newTour,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: `Fail`,
  //     message: err,
  //   });
  // }
});

module.exports = {
  getAllTours,
  getTour,
  creatTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getStatistics,
  getMonthPlan,
};
