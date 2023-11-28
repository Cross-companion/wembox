const Chat = require('../../models/chat/chatModel');
const Contact = require('../../models/contact/contactsModel');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');
const { updateContactSession } = require('../../utilities/helpers');

exports.sendChat = catchAsync(async (req, res, next) => {
  // contactID was set at contact protect.
  const { _id: senderID, contactID } = req.user;
  const { receiverID, message } = req.body;

  if (!receiverID || senderID == receiverID)
    return next(new AppError('Invalid receiverID specified.', 401));

  const [newChat] = await Chat.create(
    {
      sender: senderID,
      receiver: receiverID,
      message,
    },
    { select: 'sender receiver status message createdAt' }
  );

  const updatedContact = await Contact.findByIdAndUpdate(
    { _id: contactID },
    { lastMessage: newChat._id }
  );

  // manually set lastMessage so it'll be available at session.
  updatedContact.lastMessage = newChat;

  updateContactSession(senderID, receiverID, updatedContact, req);

  res.status(200).json({
    status: 'success',
    message,
  });
});
