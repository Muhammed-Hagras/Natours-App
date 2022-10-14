const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const AppError = require('./utiles/appError');
const errorConrtoller = require('./controllers/errorController');

dotenv.config({ path: './config.env' });

const userRouter = require('./routes/userRouter');
const tourRouter = require('./routes/tourRouter');

const app = express();
//MiddleWares
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello From MiddleWare 👋');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toString();
  next();
});

// 3) Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

app.use(errorConrtoller);

// app.get("/",(req,res) =>{
//     res.status(200).json({message: "Hello from server side ", app: "Natours"})
// })

// app.post("/",(req,res) =>{
//     res.json({message:"You can post at this point"})
// })

module.exports = app;
