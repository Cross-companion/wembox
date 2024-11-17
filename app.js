const path = require('path');

// IMPORTING 3rd party MODULES
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const webPush = require('web-push');
// const session = require('express-session'); COMPLETE COMMENT
// const RedisStore = require('connect-redis').default; COMPLETE COMMENT
// const redisClient = require('./utilities/redisInit'); COMPLETE COMMENT

//Importing Custom modules
const viewRouter = require('./routers/viewRoutes');
const userRouter = require('./routers/userRoutes');
const imageRouter = require('./routers/imageRoutes');
const suggestionRouter = require('./routers/suggestionRoutes');
const followRouter = require('./routers/followRoutes');
const contactRouter = require('./routers/contactRoutes');
const chatRouter = require('./routers/chatRoutes');
const notificationRouter = require('./routers/notificationRoutes');
const globalErrorHandler = require('./controllers/globalErrorHandler');
const TRAP = require('./utilities/trap'); // For testing purpose only
const IOHandler = require('./sockets/IOHandler');

webPush.setVapidDetails(
  'mailto:wembox.inc@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Initialize store.
// const redisStore = new RedisStore({
//   client: redisClient,
//   prefix: process.env.APP_NAME + ':',
// }); COMPLETE COMMENT

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
// app.use(
//   session({
//     store: redisStore,
//     resave: false, // required: force lightweight session keep alive (touch)
//     saveUninitialized: false, // recommended: only save session when data exists
//     secret: process.env.SESSION_SECRET_KEY,
//   })
// ); COMPLETE COMMENT

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
app.use('/api/v1/notifications', notificationRouter);
app.use('/', viewRouter);

new IOHandler(io);

app.all('*', (req, res, next) => {
  const errMessage = `Can't find ${req.originalUrl} on this server`;

  res.status(404).json({
    status: 'failed',
    message: errMessage,
  });
});

app.use(globalErrorHandler);

module.exports = server;
