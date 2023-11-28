const Contact = require('../../models/contact/contactsModel');

exports.createContact = async (users, lastMessageID) => {
  const contactData = {
    users,
    lastMessage: lastMessageID,
  };
  const [contact] = await Contact.create(contactData);
  return contact;
};
