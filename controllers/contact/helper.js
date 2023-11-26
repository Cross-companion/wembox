const Contact = require('../../models/contact/contactsModel');

exports.createContact = async (users, lastMessageID) => {
  const contactData = {
    users,
    lastMessage: lastMessageID,
  };
  await Contact.create(contactData);
};
