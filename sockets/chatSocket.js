const Chat = require('../models/chat/chatModel');
const {
  chatStatusEnum,
  deliveredStatus,
  defaultChatStatus,
  seenStatus,
} = require('../config/chatConfig');
const {
  getNumSocketClients,
  createChatRoomStr,
} = require('../utilities/helpers');
const Contact = require('../models/contact/contactsModel');

exports.chatSent = async (
  socket,
  chatData = { newChat: {}, updatedContact: {} },
  io
) => {
  const receiver = chatData?.newChat?.receiver;
  const sender = chatData?.newChat?.sender;
  const contactId = chatData?.updatedContact?._id;
  const newChatId = chatData?.newChat?._id;
  let receiverInChatRoom = false;

  if (!receiver || !sender || !contactId || !newChatId) return;
  chatData.newChat.wasReceived = true;
  chatData.updatedContact.unseenMessages =
    chatData?.updatedContact.unseens[receiver];
  socket.to(receiver).emit('chatReceived', chatData);

  if (!getNumSocketClients(io, receiver)) return; // Is basically not online.
  if (getNumSocketClients(io, createChatRoomStr(contactId, receiver))) {
    receiverInChatRoom = true;
    chatData.updatedContact.unseens[receiver] = 0;
    chatData.updatedContact.unseenMessages =
      chatData.updatedContact.unseens[receiver];
  } // Means receiver is in chat room.

  const newChatStatus = receiverInChatRoom ? seenStatus : deliveredStatus;
  chatData.newChat.status = newChatStatus;
  socket.emit('chatProcessed', chatData);

  await Chat.updateOne(
    { _id: newChatId },
    { status: receiverInChatRoom ? seenStatus : deliveredStatus }
  );
  receiverInChatRoom &&
    (await Contact.updateOne(
      { _id: contactId },
      { [`unseens.${receiver}`]: 0 }
    ));
};

exports.updateChatStatus = async (
  socket,
  queryObj = { sender: '', status: '' }
) => {
  const { status } = queryObj;
  if (!chatStatusEnum.includes(status) || !socket.user.id || !sender) return;

  await Chat.updateMany({ receiver: socket.user.id, sender }, { status });
};
