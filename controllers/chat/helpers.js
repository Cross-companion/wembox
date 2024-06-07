const Chat = require('../../models/chat/chatModel');

const getChatsFromDB = async (usersArr, skipBy, chatsLimit) => {
  const recentChats = await Chat.find({
    receiver: { $in: usersArr },
    sender: { $in: usersArr },
  })
    .sort({ createdAt: 1 })
    .select('-contactRequest')
    .skip(skipBy || 0)
    .limit(chatsLimit || chatsPerRequest || 20);

  return recentChats;
};

module.exports = {
  getChatsFromDB,
};
