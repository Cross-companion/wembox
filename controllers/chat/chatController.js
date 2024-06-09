const multer = require('multer');
const Chat = require('../../models/chat/chatModel');
const Contact = require('../../models/contact/contactsModel');
const { getChatsFromDB, multerStorage, multerFilter } = require('./helpers');
const {
  defaultChatStatus,
  seenStatus,
  deliveredStatus,
  deletedStatus,
  deletedMessageString,
  chatsPerRequest,
} = require('../../config/chatConfig');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadChatImages = upload.fields([{ name: 'chatImages', maxCount: 1 }]);

exports.sendChat = catchAsync(async (req, res, next) => {
  // contactID was set at contact protect.
  const { _id: senderID, contactID } = req.user;

  const { receiverID, message } = req.body;

  if (!receiverID || senderID == receiverID)
    return next(new AppError('Invalid users specified.', 401));

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
    { lastMessage: newChat._id, $inc: { [`unseens.${receiverID}`]: 1 } },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    newChat,
  });
});

exports.getRecentChats = catchAsync(async (req, res, next) => {
  const { _id: userID } = req.user;
  const { otherUserID, page = 1 } = req.params;
  const usersArr = [userID, otherUserID];
  const chatsLimit = chatsPerRequest || 20;
  const skipBy = (page - 1) * chatsLimit;

  if (!otherUserID || userID == otherUserID)
    return next(new AppError('Invalid users specified.', 401));
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

  await Contact.updateOne(
    {
      users: { $all: [userID, otherUserID] },
    },
    { [`unseens.${userID}`]: 0 }
  );

  const recentChats = await getChatsFromDB(usersArr, skipBy, chatsLimit);

  res.status(200).json({
    status: 'success',
    results: recentChats.length,
    chats: recentChats,
  });
});

exports.deleteChat = catchAsync(async (req, res, next) => {
  const { _id: userID } = req.user;
  const { otherUserID, chatID } = req.body;
  const usersArr = [userID, otherUserID];

  if (!otherUserID || userID == otherUserID)
    return next(new AppError('Invalid users specified.', 401));
  if (!chatID)
    return next(new AppError('No chat to be deleted was specified.', 401));

  const deletedChat = await Chat.findOneAndUpdate(
    {
      _id: chatID,
      receiver: { $in: usersArr },
      sender: { $in: usersArr },
      'contactRequest.isActivationChat': { $in: [false, undefined] },
    },
    { status: deletedStatus, message: deletedMessageString },
    {
      new: true,
      runValidators: true,
    }
  ).select('-contactRequest');

  res.status(200).json({
    status: 'success',
    deletedChat,
  });
});

exports.deliverChats = catchAsync(async (req, res, next) => {
  const { _id: userID } = req.user;

  await Chat.updateMany(
    { status: defaultChatStatus, receiver: userID },
    { status: deliveredStatus }
  );

  next();
});
