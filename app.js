const path = require('path');

// IMPORTING 3rd party MODULES
const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const RedisStore = require('connect-redis').default;
const redisClient = require('./utilities/redisInit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

//Importing Custom modules
const viewRouter = require('./routers/viewRoutes');
const userRouter = require('./routers/userRoutes');
const imageRouter = require('./routers/imageRoutes');
const suggestionRouter = require('./routers/suggestionRoutes');
const followRouter = require('./routers/followRoutes');
const contactRouter = require('./routers/contactRoutes');
const chatRouter = require('./routers/chatRoutes');
const globalErrorHandler = require('./controllers/globalErrorHandler');
const TRAP = require('./utilities/trap'); // For testing purpose only

const app = express();

// Initialize store.
const redisStore = new RedisStore({
  client: redisClient,
  prefix: process.env.APP_NAME + ':',
});

// SETTING UP PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Body parser, reading data from body to req.body
app.use(express.json()); // Limits to datacan be added

// Use morgan on dev only
if (process.env.NODE_ENV !== 'production') {
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
app.use('/images', imageRouter);
app.use('/api/v1/suggest', suggestionRouter);
app.use('/api/v1/follow', followRouter);
app.use('/api/v1/contacts', contactRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/', viewRouter);

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
