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
    $inc: { 'contactRequest.sent': 1 },
  };
  const receiverUpdates = {
    $inc: { 'contactRequest.unViewed': 1, 'contactRequest.received': 1 },
  };

  try {
    const confirmReciever = await User.findById({ _id: receiverID });
    if (!confirmReciever) return next(new AppError('Reciever not found', 404));
    await Chat.create(conRequestData);
  } catch (err) {
    if (err?.code === 11000) {
      // If isActivationChat is still `true` and there was a duplicate error on creation, This means that there had being this contact request before but it had been declined. Our application makes room for a user to send another request if the first was declined.
      if (!message) conRequestData.message = undefined;
      const { nModified } = await Chat.updateOne(
        {
          sender: senderID,
          receiver: receiverID,
          'contactRequest.isActivationChat': true,
          'contactRequest.status': { $eq: declinedStatus },
        },
        conRequestData
      );

      if (nModified < 1)
        return next(
          new AppError(
            'Contact request has already been sent and is pending or has been accepted.',
            404
          )
        );
    }
  }

  const receiver = await User.findOneAndUpdate(
    receiverFilter,
    receiverUpdates,
    {
      new: true,
      runValidators: true,
    }
  );

  await User.findOneAndUpdate(senderFilter, senderUpdates, {
    new: true,
    runValidators: true,
  });

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
    'contactRequest.status': defaultRequestStatus,
    'contactRequest.isLastChat': true,
  }).populate('sender', populationData);

  await User.findOneAndUpdate(
    { _id: receiverID },
    { 'contactRequest.unViewed': 0 },
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

  if (!ID) return next(new AppError('Invalid user._id, please log in'));
  if (!ID == senderID)
    return next(
      new AppError('You cannot send a contact request to your account.')
    );
  if (!requestStatusEnum.includes(status) || !senderID)
    return next(new AppError('Invalid status or senderID', 401));
  if (status === defaultRequestStatus)
    return next(
      new AppError('Status of contact request must be modified.', 401)
    );

  try {
    const { nModified } = await Chat.updateOne(
      {
        sender: senderID,
        receiver: ID,
        'contactRequest.isActivationChat': true,
      },
      {
        'contactRequest.status': status,
      }
    );

    if (nModified < 1)
      return next(new AppError('No contact request had been created.', 404));

    const wasAccepted = status === acceptedStatus;
    if (wasAccepted)
      await User.findOneAndUpdate(
        { _id: ID },
        {
          $inc: { 'contactRequest.accepted': 1 },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    res.status(200).json({
      status: 'success',
      message: `${status} request successfully`,
    });
  } catch (err) {
    return next(new AppError(err.message, 404));
  }
});
