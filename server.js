const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

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
    console.log(err);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
