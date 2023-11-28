const Chat = require('../../models/chat/chatModel');
const Contact = require('../../models/contact/contactsModel');
const { seenStatus, deliveredStatus } = require('../../config/chatConfig');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');
const { updateContactSession } = require('../../utilities/helpers');
const APIFeature = require('../../utilities/APIFeatures');

exports.sendChat = catchAsync(async (req, res, next) => {
  // contactID was set at contact protect.
  const { _id: senderID, contactID } = req.user;
  const { receiverID, message } = req.body;

  if (!receiverID || senderID == receiverID)
    return next(new AppError('Invalid receiverID specified.', 401));

  const [newChat] = await Chat.create(
    [
      {
        sender: senderID,
        receiver: receiverID,
        message,
      },
    ],
    { select: 'sender receiver status message createdAt' }
  );

  const updatedContact = await Contact.findByIdAndUpdate(
    { _id: contactID },
    { lastMessage: newChat._id }
  );

  updateContactSession(req, {
    senderID,
    receiverID,
    lastMessage: newChat,
  });

  res.status(200).json({
    status: 'success',
    message,
  });
});

exports.viewReceivedChats = catchAsync(async (req, res, next) => {
  const { _id: userID } = req.user;
  const { otherUserID, page = 1 } = req.body;
  const usersArr = [userID, otherUserID];
  const chatsLimit = 2;
  const skipBy = (page - 1) * chatsLimit;

  if (!otherUserID || userID == otherUserID)
    return next(new AppError('Invalid id for other user specified.', 401));
  if (page < 1)
    return next(new AppError('Invalid page number specified.', 401));

  await Chat.updateMany(
    {
      receiver: userID,
      sender: otherUserID,
      status: deliveredStatus,
    },
    { status: seenStatus }
  );
  const recentChats = await Chat.find({
    receiver: { $in: usersArr },
    sender: { $in: usersArr },
  })
    .sort({ createdAt: -1 })
    .select('-contactRequest')
    .limit(chatsLimit)
    .skip(skipBy);

  res.status(200).json({
    status: 'success',
    chats: recentChats,
  });
});

exports.deleteChat = catchAsync(async (req, res, next) => {});
