const User = require('../models/userMode');
const catchAsync = require('../utiles/catchAsync');

const signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    eamil: req.body.eamil,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

module.exports = {
  signUp,
};
