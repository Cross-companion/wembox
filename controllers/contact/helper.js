const Contact = require('../../models/contact/contactsModel');
const User = require('../../models/user/userModel');

exports.createContact = async (users, lastMessageID) => {
  const contactData = {
    users,
    lastMessage: lastMessageID,
  };
  const contact = await Contact.create(contactData);
  return contact;
};

exports.updateContactSession = (req, { senderID, receiverID, lastMessage }) => {
  const userIDArray = [senderID, receiverID];
  for (let i = 0; i < userIDArray.length; i++) {
    const userID = userIDArray[i];
    const contactSessionKey = `${process.env.USER_RECENT_50_CONTACTS_SESSION_KEY}${userID}`;
    const contactList = req.session[contactSessionKey];

    if (!contactList || contactList?.length < 1) return;

    contactList.forEach((contact) => {
      const isContact =
        contact.users.includes(receiverID) && contact.users.includes(senderID);
      if (isContact) contact.lastMessage = lastMessage;
    });

    contactList.sort(
      (a, b) => a.lastMessage.createdAt + a.lastMessage.createdAt
    );

    req.session[contactSessionKey] = contactList;
  }
};
