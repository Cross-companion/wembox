const multer = require('multer');
const Chat = require('../../models/chat/chatModel');
const { seenStatus, deliveredStatus } = require('../../config/chatConfig');
const Contact = require('../../models/contact/contactsModel');

const getChatsFromDB = async (usersArr, skipBy, chatsLimit) => {
  const recentChats = await Chat.find({
    receiver: { $in: usersArr },
    sender: { $in: usersArr },
  })
    .sort({ createdAt: 1 })
    .select('-contactRequest')
    .skip(skipBy || 0);
  // .limit(300 || chatsLimit || chatsPerRequest || 20);

  return recentChats;
};

const updateToSeen = async function (userId, otherUserId) {
  await Chat.updateMany(
    {
      receiver: userId,
      sender: otherUserId,
      status: deliveredStatus,
    },
    { status: seenStatus }
  );

  await Contact.updateOne(
    {
      users: { $all: [userId, otherUserId] },
    },
    { [`unseens.${userId}`]: 0 }
  );
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
  updateToSeen,
  multerStorage,
  multerFilter,
};
