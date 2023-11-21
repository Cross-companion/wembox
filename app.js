const path = require('path');

// IMPORTING 3rd party MODULES
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redisClient = require('./utilities/redisInit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

//Importing Custom modules
const userRouter = require('./routers/userRoutes');
const suggestionRouter = require('./routers/suggestionRoutes');
const followRouter = require('./routers/followRoutes');
const contactRouter = require('./routers/contactRoutes');
const globalErrorHandler = require('./controllers/globalErrorHandler');
const TRAP = require('./utilities/trap'); // For testing purpose only

const app = express();

// Initialize store.
const redisStore = new RedisStore({
  client: redisClient,
  prefix: process.env.APP_NAME + ':',
});

// Serving static files
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Body parser, reading data from body to req.body
app.use(express.json()); // Limits to datacan be added

// Use morgan on dev only
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize sesssion storage.
app.use(
  session({
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: process.env.SESSION_SECRET_KEY,
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// MOUNTING ROUTERS
app.use('/api/v1/users', userRouter);
app.use('/api/v1/suggest', suggestionRouter);
app.use('/api/v1/follow', followRouter);
app.use('/api/v1/contacts', contactRouter);

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
