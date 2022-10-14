const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signUp', authController.signUp);

//Routes Users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.creatUser);

router.route('/:id').get(userController.getUser);

module.exports = router;
