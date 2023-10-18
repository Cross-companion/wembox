exports.captcha = catchAsync(async (req, res, next) => {
  const captchaResponse = req.body.captcha;
  const verifyURL = `${process.env.RECATPCHA_VERIFY_URL}?secret=${process.env.RECATPCHA_SECRET_KEY}&response=${captchaResponse}&remoteip=${req.connection.remoteAddress}`;

  request(verifyURL, (err, response, body) => {
    body = JSON.parse(body);
    if (body.success === true) {
      return next();
    } else return next(new AppError('Your verification failed'));
  });
});
