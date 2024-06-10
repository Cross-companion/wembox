const multer = require('multer');
const Chat = require('../../models/chat/chatModel');

const getChatsFromDB = async (usersArr, skipBy, chatsLimit) => {
  const recentChats = await Chat.find({
    receiver: { $in: usersArr },
    sender: { $in: usersArr },
  })
    .sort({ createdAt: 1 })
    .select('-contactRequest')
    .skip(skipBy || 0)
    .limit(300 || chatsLimit || chatsPerRequest || 20);

  return recentChats;
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image!. Please upload only images.'), false);
  }
};

module.exports = {
  getChatsFromDB,
  multerStorage,
  multerFilter,
};
