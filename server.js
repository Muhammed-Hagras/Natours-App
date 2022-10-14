const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });
// console.log(process.env.NODE_ENV)
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('uncaughtException! shutting down....');
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  // console.log(con.connections);
  console.log(`DB connected Successfully.....`);
});
//Listen To Server
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App starts on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandledRejection! shutting down....');
  server.close(() => {
    process.exit(1);
  });
});
