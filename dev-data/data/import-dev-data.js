const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
// const { json } = require('express');

dotenv.config({ path: './config.env' });
// console.log(process.env.NODE_ENV)

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then(() => {
  // console.log(con.connections);
  console.log(`DB connected Successfully`);
});

//Read Json File
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//Import Data Into DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log(`Data Successfully Loaded`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delete All Data From DB
const deletetData = async () => {
  try {
    await Tour.deleteMany();
    console.log(`Data Successfully deleted`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deletetData();
}

console.log(process.argv);
