const path = require('path');

// IMPORTING 3rd party MODULES
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

//Importing Custom modules
const userRouter = require('./routers/userRoutes');
const suggestionRouter = require('./routers/suggestionRoutes');
const globalErrorHandler = require('./controllers/globalErrorHandler');

const app = express();

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Body parser, reading data from body to req.body
app.use(express.json()); // Limits to datacan be added

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
app.use('/api/v1/users', userRouter);
app.use('/api/v1/suggest', suggestionRouter);

app.all('*', (req, res, next) => {
  const errMessage = `Can't find ${req.originalUrl} on this server`;

  //   next(new AppError(errMessage, 404))
  res.status(404).json({
    status: 'failed',
    message: errMessage,
  });
});

app.use(globalErrorHandler);

module.exports = app;
