const Chat = require('../../models/chat/chatModel');
const {
  seenStatus,
  deletedStatus,
  deletedMessageString,
  chatsPerRequest,
} = require('../../config/chatConfig');

const getSessionKey = (usersArr = []) => {
  const numberOfIDs = 2;
  if (usersArr?.length < numberOfIDs) throw new Error('Invalid user IDs');
  const sessionID = usersArr.sort().join('-');

  return `${process.env.RECENT_CHATS_SESSION_KEY}${sessionID}`;
};

const getChatsFromDB = async (usersArr, skipBy, chatsLimit) => {
  const recentChats = await Chat.find({
    receiver: { $in: usersArr },
    sender: { $in: usersArr },
  })
    .sort({ createdAt: -1 })
    .select('-contactRequest')
    .skip(skipBy || 0)
    .limit(chatsLimit || chatsPerRequest || 20);

  return recentChats;
};

const seenSessionChats = (chats, receiver) => {
  if (!chats?.length) throw new Error('Invalid chats @seenSessionChats');
  if (!receiver) throw new Error('Invalid receiver @seenSessionChats');
  for (let i = 0; i < chats.length; i++) {
    console.log(
      chats[i].status === seenStatus && receiver == chats[i].receiver,
      'GH'
    );
    if (chats[i].status === seenStatus && receiver == chats[i].receiver) break;
    if (receiver == chats[i].receiver) chats[i].status = seenStatus;
  }

  return chats;
};

const getSessionedChats = async (
  req,
  { usersArr = [], receiver, seenChats = false }
) => {
  const chatSessionKey = getSessionKey(usersArr);
  const sessionedChats = req.session[chatSessionKey];

  if (!sessionedChats?.length)
    req.session[chatSessionKey] = await getChatsFromDB(usersArr);

  if (seenChats)
    req.session[chatSessionKey] = seenSessionChats(
      req.session[chatSessionKey],
      receiver
    );

  return req.session[chatSessionKey];
};

const deleteSessionedChat = (
  req,
  { chatSessionKey, chatID, deleteStatus = deletedStatus }
) => {
  if (!chatSessionKey) throw new Error('Invalid session key for chats.');
  req.session[chatSessionKey].find((chat, i, chatList) => {
    const isChat = chat._id == chatID;
    if (!isChat) return false;
    chatList[i].status = deleteStatus;
    chatList[i].message = deletedMessageString;
    console.log(chatList[i]);
    return true;
  });
};

module.exports = {
  getSessionKey,
  getChatsFromDB,
  seenSessionChats,
  getSessionedChats,
  deleteSessionedChat,
};
