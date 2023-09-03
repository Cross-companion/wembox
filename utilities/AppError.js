class AppError extends Error {
  constructor(message, statusCode, status) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status =
      this.statusCode >= 400 && this.statusCode <= 499 ? 'fail' : 'error';

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
