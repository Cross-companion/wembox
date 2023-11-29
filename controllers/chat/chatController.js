const Chat = require('../../models/chat/chatModel');
const Contact = require('../../models/contact/contactsModel');
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
const { updateContactSession } = require('../../utilities/helpers');
const APIFeature = require('../../utilities/APIFeatures');

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

exports.getRecentChats = catchAsync(async (req, res, next) => {
  const { _id: userID } = req.user;
  const { otherUserID, page = 1 } = req.body;
  const usersArr = [userID, otherUserID];
  const chatsLimit = chatsPerRequest || 20;
  const skipBy = (page - 1) * chatsLimit;

  if (!otherUserID || userID == otherUserID)
    return next(new AppError('Invalid users specified.', 401));
  if (page < 1)
    return next(new AppError('Invalid page number specified.', 401));

  const { nModified } = await Chat.updateMany(
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

  nModified &&
    updateContactSession(req, {
      senderID: userID,
      receiverID: otherUserID,
      lastMessage: recentChats[0],
    });

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

  deletedChat &&
    updateContactSession(req, {
      senderID: userID,
      receiverID: otherUserID,
      lastMessage: deletedChat,
      isDeleted: true,
    });

  res.status(200).json({
    status: 'success',
    deletedChat,
  });
});

exports.deliverChats = catchAsync(async (req, res, next) => {
  const { _id: userID } = req.user;
  const contactSessionKey = `${process.env.USER_RECENT_50_CONTACTS_SESSION_KEY}${userID}`;
  const contactList = req.session[contactSessionKey];

  if (
    !contactList?.length ||
    contactList[0].lastMessage?.receiver !== userID ||
    contactList[0].lastMessage?.status !== defaultChatStatus
  )
    return next();

  await Chat.updateMany(
    { status: defaultChatStatus, receiver: userID },
    { status: deliveredStatus }
  );

  for (let i = 0; i < contactList.length; i++) {
    const contact = contactList[i];
    const otherUserID = contact.otherUser[0]._id;
    const stopLoop = contact.lastMessage?.status !== defaultChatStatus;

    // Breaks if it encounters a delivered / accepted lastMessage. This would mean that there are no more undelivered chats.
    if (stopLoop) break;
    contactList[i].lastMessage.status = deliveredStatus;

    // Update other users request session.
    const otherUserSessionKey = `${process.env.USER_RECENT_50_CONTACTS_SESSION_KEY}${otherUserID}`;
    const otherUserContactList = req.session[otherUserSessionKey];
    otherUserContactList.find((contact, i, contactListArray) => {
      const isContact =
        contactListArray[i].users.includes(userID) &&
        contactListArray[i].users.includes(otherUserID);

      if (!isContact) return false;

      contactListArray[i].lastMessage.status = deliveredStatus;
      return true;
    });
  }

  next();
});
