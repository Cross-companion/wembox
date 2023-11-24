const User = require('../../models/user/userModel');
const Chat = require('../../models/chat/chatModel');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');

// Messages could include be @wm.com mails
exports.sendChat = catchAsync(async (req, res, next) => {
  const { _id: senderID } = req.user;
  const { recieverID, message } = req.body;

  if (!recieverID || senderID == recieverID)
    return next(new AppError('Invalid recieverID specified.', 401));

  await Chat.create({
    sender: senderID,
    reciever: recieverID,
    message,
  });
});
