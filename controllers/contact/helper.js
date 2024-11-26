const Contact = require('../../models/contact/contactsModel');
const User = require('../../models/user/userModel');
const { contactsPerRequest } = require('../../config/contactConfig');
const { default: mongoose } = require('mongoose');

exports.createContact = async (users, lastMessageID) => {
  const contactData = {
    users,
    lastMessage: lastMessageID,
  };
  const contact = await Contact.create(contactData);
  return contact;
};

exports.getContactsQuery = async (query, { userID, contactsLimit, skipBy }) => {
  if (!(query && userID)) throw new Error('Invalid query or userID');

  const mongooseUserID = new mongoose.Types.ObjectId(userID);

  const contactList = await Contact.aggregate([
    {
      $match: {
        users: mongooseUserID,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'users',
        foreignField: '_id',
        as: 'otherUser',
      },
    },
    { $unwind: '$otherUser' },
    {
      $match: {
        'otherUser._id': { $ne: mongooseUserID },
      },
    },
    {
      $lookup: {
        from: 'chats',
        localField: 'lastMessage',
        foreignField: '_id',
        as: 'lastMessage',
      },
    },
    { $unwind: '$lastMessage' },
    {
      $addFields: {
        unseenMessages: `$unseens.${mongooseUserID}`,
      },
    },
    {
      $project: {
        createdAt: 1,
        unseens: 1,
        unseenMessages: 1,
        'otherUser._id': 1,
        'otherUser.name': 1,
        'otherUser.profileImage': 1,
        'otherUser.frontEndUsername': 1,
        'otherUser.note': 1,
        'otherUser.subscription': 1,
        'lastMessage.status': 1,
        'lastMessage.sender': 1,
        'lastMessage.receiver': 1,
        'lastMessage.message': 1,
        'lastMessage.media': 1,
        'lastMessage.createdAt': 1,
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
    { $skip: skipBy || 0 },
    { $limit: contactsLimit || contactsPerRequest || 50 },
  ]);

  // const contactList = await Contact.find(query)
  //   .populate({
  //     path: 'otherUser',
  //     match: { _id: { $ne: userID } },
  //     select: 'name profileImage frontEndUsername username',
  //   })
  //   .limit(contactsLimit || contactsPerRequest || 50)
  //   .skip(skipBy || 0)
  //   .populate('lastMessage', 'status sender receiver message createdAt')
  //   .sort({ 'lastMessage.createdAt': -1 });

  return contactList;
};
