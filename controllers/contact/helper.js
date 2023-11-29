const Contact = require('../../models/contact/contactsModel');
const User = require('../../models/user/userModel');
const { contactsPerRequest } = require('../../config/contactConfig');

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

  const contactList = await Contact.find(query)
    .populate({
      path: 'otherUser',
      match: { _id: { $ne: userID } },
      select: 'username',
    })
    .limit(contactsLimit || contactsPerRequest || 50)
    .skip(skipBy || 0)
    .populate('lastMessage', 'status sender receiver message createdAt')
    .sort({ 'lastMessage.createdAt': -1 });

  return contactList;
};
