const path = require('path');

// IMPORTING 3rd party MODULES
const express = require('express');
const morgan = require('morgan');

//Importing Custom modules
const usersRouter = require('./routers/userRoutes');
const app = express();

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Use morgan on dev only
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// MOUNTING ROUTERS
app.use('api/v1/user', usersRouter);

app.all('*', (req, res, next) => {
  const errMessage = `Can't find ${req.originalUrl} on this server`;

  //   next(new AppError(errMessage, 404))
  res.status(404).json({
    status: 'failed',
    message: errMessage,
  });
});

module.exports = app;