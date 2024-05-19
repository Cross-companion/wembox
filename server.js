const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

// process.on('uncaughtException', (err) => {
//   console.log(err);
//   console.log('UNCAUGHT EXCEPTION');
//   process.exit();
// });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.log(err, '////\\\\/////');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Safety Net
// process.on('unhandledRejection', (err) => {
//   console.log(err.name, err.message);
//   console.log('UNHANDLED REJECTION 💥 - shutting down...');

//   server.close(() => process.exit(1));
// });
