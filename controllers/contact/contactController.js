const User = require('../../models/user/userModel');
const Chat = require('../../models/chat/chatModel');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');

exports.sendContactRequest = catchAsync(async (req, res, next) => {
  const { username, _id: senderID } = req.user;
  const { receiverID, message } = req.body;

  if (!receiverID || senderID == receiverID)
    return next(new AppError('Invalid receiverID specified.', 401));

  const conRequestData = {
    senderID,
    receiverID,
    contactRequest: {
      isContactRequest: true,
      isActivationChat: true,
      isLastChat: true,
      status: 'pending',
    },
  };

  if (message) conRequestData.message = message;

  const senderFilter = { _id: senderID };
  const receiverFilter = { _id: receiverID };

  const senderUpdates = {
    $inc: { 'contactRequests.sent': 1 },
  };
  const receiverUpdates = {
    $inc: { 'contactRequests.unViewed': 1, 'contactRequests.received': 1 },
  };

  await Chat.create(conRequestData);

  await User.findOneAndUpdate(senderFilter, senderUpdates, {
    new: true,
    runValidators: true,
  });
  const receiver = await User.findOneAndUpdate(
    receiverFilter,
    receiverUpdates,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${username}, your contact request to ${receiver.frontEndUsername} has been sent`,
  });
});

exports.getreceivedContactRequests = catchAsync(async (req, res, next) => {
  const receiverID = req.user._id;

  const receivedContactRequests = await Chat.find({
    receiverID,
    'contactRequest.isContactRequest': true,
    'contactRequest.isLastChat': true,
  }).populate('senderID');

  await User.findOneAndUpdate(
    { _id: receiverID },
    { 'contactRequests.unViewed': 0 },
    {
      new: true,
      runValidators: true,
    }
  );

  [
    'name frontEndUsername profileImg accountType numberOfFollowers numberOfFollowing',
  ];
  res.status(200).json({ status: 'success', data: receivedContactRequests });
});
