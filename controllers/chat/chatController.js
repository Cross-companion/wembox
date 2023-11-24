const User = require('../../models/user/userModel');
const Chat = require('../../models/chat/chatModel');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');

// Messages could include be @wm.com mails
exports.sendChat = catchAsync(async (req, res, next) => {
  const { _id: senderID } = req.user;
  const { receiverID, message } = req.body;

  if (!receiverID || senderID == receiverID)
    return next(new AppError('Invalid receiverID specified.', 401));

  await Chat.create({
    sender: senderID,
    receiver: receiverID,
    message,
  });
});
