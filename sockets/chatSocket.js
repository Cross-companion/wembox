exports.chatSent = (socket, chatData = { newChat: {}, updatedContact: {} }) => {
  chatData.newChat.wasReceived = true;
  chatData.updatedContact.unseenMessages =
    chatData?.updatedContact.unseens[chatData.newChat.receiver];
  socket.to(chatData.newChat.receiver).emit('chatReceived', chatData);
};
