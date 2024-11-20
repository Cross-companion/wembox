const multer = require('multer');
const Chat = require('../../models/chat/chatModel');
const Contact = require('../../models/contact/contactsModel');
const {
  getChatsFromDB,
  multerStorage,
  multerFilter,
  updateToSeen,
} = require('./helpers');
const {
  defaultChatStatus,
  deliveredStatus,
  deletedStatus,
  deletedMessageString,
  chatsPerRequest,
} = require('../../config/chatConfig');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');
const ImageFile = require('../../utilities/imageFileManager');
const { CHAT_IMAGE_PREFIX, AWS_CHAT_IMAGES_FOLDER, ROOT_IMAGE_ROUTE } =
  process.env;

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadChatImages = upload.fields([
  { name: 'chatImages', maxCount: 20 },
]);

exports.handleChatImages = catchAsync(async (req, res, next) => {
  let { chatImages } = req.files;
  const { _id: userID } = req.user;

  if (!chatImages || !chatImages?.length) return next();
  const media = { type: 'image', payload: [] };

  const imagePromises = chatImages.map((image, i) => {
    return (async () => {
      const img = new ImageFile({
        image: image,
        uniqueID: `${userID}-${Math.ceil(Math.random() * 1000)}`,
        prefix: CHAT_IMAGE_PREFIX,
        folderName: AWS_CHAT_IMAGES_FOLDER,
      });

      await img?.uploadToAWS({ useSharp: false });
      // await img?.uploadToLocal({ useSharp: false });
      media.payload[i] = `${ROOT_IMAGE_ROUTE}${img.imageName}`;
    })();
  });

  await Promise.all(imagePromises);

  req.body.media = media;
  next();
});

exports.sendChat = catchAsync(async (req, res, next) => {
  // contactID was set at contact protect.
  const { _id: senderID, contactID } = req.user;

  const { receiverID, message, media, createdAt } = req.body;

  if (!receiverID || senderID == receiverID)
    return next(new AppError('Invalid users specified.', 401));

  const [newChat] = await Chat.create(
    [
      {
        sender: senderID,
        receiver: receiverID,
        message,
        media,
        createdAt,
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
  ).populate('otherUser', 'name frontEndUsername profileImage subscription');

  if (updatedContact?.otherUser?.length)
    updatedContact.otherUser = updatedContact.otherUser.find(
      (user) => String(user.id) !== req.user._id
    );

  res.status(200).json({
    status: 'success',
    newChat,
    updatedContact,
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

  await updateToSeen(userID, otherUserID);

  const recentChats = await getChatsFromDB(usersArr, skipBy, chatsLimit);

  res.status(200).json({
    status: 'success',
    results: recentChats.length,
    chats: recentChats,
  });
});

exports.seenRecentChats = catchAsync(async (req, res, next) => {
  const { _id: userId } = req.user;
  const { otherUserId } = req.params;

  if (!otherUserId || userId == otherUserId)
    return next(new AppError('Invalid users specified.', 401));

  await updateToSeen(userId, otherUserId);

  res.status(200).json({ status: 'success' });
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
