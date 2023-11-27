const Chat = require('../../models/chat/chatModel');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');

exports.sendChat = catchAsync(async (req, res, next) => {
  const { _id: senderID } = req.user;
  const { receiverID, message } = req.body;

  if (!receiverID || senderID == receiverID)
    return next(new AppError('Invalid receiverID specified.', 401));

  // await Chat.create({
  //   sender: senderID,
  //   receiver: receiverID,
  //   message,
  // });

  res.status(200).json({
    status: 'success',
    message,
  });
});
