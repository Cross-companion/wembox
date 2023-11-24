const User = require('../../models/user/userModel');
const Chat = require('../../models/chat/chatModel');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');

exports.sendContactRequest = catchAsync(async (req, res, next) => {
  const { username, _id: senderID } = req.user;
  const { recieverID, message } = req.body;
  let updateStatus;

  if (!recieverID || senderID == recieverID)
    return next(new AppError('Invalid recieverID specified.', 401));

  const conRequestData = {
    sender: senderID,
    reciever: recieverID,
    contactRequest: {
      isContactRequest: true,
      isActivationChat: true,
      status: 'pending',
    },
  };

  if (message) conRequestData.message = message;

  const senderFilter = { _id: senderID };
  const recieverFilter = { _id: recieverID };

  const senderUpdates = {
    $inc: { 'contactRequests.sent': 1 },
  };
  const recieverUpdates = {
    $inc: { 'contactRequests.unViewed': 1, 'contactRequests.received': 1 },
  };

  try {
    await Chat.create(conRequestData).catch((err) => {
      throw new Error(err);
    });

    await User.findOneAndUpdate(senderFilter, senderUpdates, {
      new: true,
      runValidators: true,
    });
    await User.findOneAndUpdate(recieverFilter, recieverUpdates, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    return next(new AppError(err), 401);
  }

  res.status(200).json({
    status: 'success',
    message: `${username}, your contact request to ${recieverID} has been sent`,
  });
});
