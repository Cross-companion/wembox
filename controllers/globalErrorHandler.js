const sendErrorDev = (err, req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.status).json({
      message:
        'There was an Error with your request. Please confirm that you are requesting from the /api endpoint',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV !== 'production') sendErrorDev(err, req, res, next);
  else {
    sendErrorDev(err, req, res, next); // ** CODE YET TO BE IMPLEMENTED ** //
  }
};
