const mongoose = require('mongoose');

const dotenv = require('dotenv');
const envFile =
  process.env.NODE_ENV === 'production'
    ? './config.env'
    : './Research files/secrets/.env';
dotenv.config({ path: envFile });

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

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
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
