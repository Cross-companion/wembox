const User = require('../../models/user/userModel');
const Chat = require('../../models/chat/chatModel');
const {
  requestStatusEnum,
  defaultRequestStatus,
  acceptedStatus,
  declinedStatus,
} = require('../../config/contactConfig');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');

exports.sendContactRequest = catchAsync(async (req, res, next) => {
  const { username, _id: senderID } = req.user;
  const { receiverID, message } = req.body;

  if (!receiverID || senderID == receiverID)
    return next(new AppError('Invalid receiverID specified.', 401));

  const conRequestData = {
    sender: senderID,
    receiver: receiverID,
    contactRequest: {
      isContactRequest: true,
      isActivationChat: true,
      isLastChat: true,
      status: defaultRequestStatus,
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

  const populationData =
    'name frontEndUsername profileImg accountType numberOfFollowers numberOfFollowing IPGeoLocation';
  const receivedContactRequests = await Chat.find({
    receiver: receiverID,
    'contactRequest.isContactRequest': true,
    'contactRequest.isLastChat': true,
  }).populate('sender', populationData);

  await User.findOneAndUpdate(
    { _id: receiverID },
    { 'contactRequests.unViewed': 0 },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    results: receivedContactRequests.length,
    data: receivedContactRequests,
  });
});

exports.processContactRequest = catchAsync(async (req, res, next) => {
  const { _id: ID } = req.user;
  const { status, senderID } = req.body;

  if (!requestStatusEnum.includes(status) || !senderID)
    return next(new AppError('Invalid status or senderID', 401));
  if (status === defaultRequestStatus)
    return next(
      new AppError('Status of contact request must be modified.', 401)
    );

  try {
    const updated = await Chat.updateMany(
      { sender: senderID, receiver: ID },
      { 'contactRequests.status': status }
    );
    console.log(senderID, ID);
    console.log(updated);
    if (updated.nModified < 1)
      return next(new AppError('No contact request had been created.', 404));

    res.status(200).json({
      status: 'success',
      message: `${status} request successfully`,
    });
  } catch (err) {
    return next(new AppError(err.message, 404));
  }
});
