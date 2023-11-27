const Contact = require('../../models/contact/contactsModel');

exports.createContact = async (users, lastMessageID) => {
  const contactData = {
    users,
    lastMessage: lastMessageID,
  };
  const contact = await Contact.create(contactData);
  return contact;
};

exports.updateContactSession = (senderID, receiverID, updateData, req) => {
  const receiverContactSessionKey = `${process.env.USER_RECENT_50_CONTACTS_SESSION_KEY}${receiverID}`;
  const senderContactSessionKey = `${process.env.USER_RECENT_50_CONTACTS_SESSION_KEY}${senderID}`;

  const receiverContactList = req.session[receiverContactSessionKey];
  const senderContactList = req.session[senderContactSessionKey];
  const contactListsArr = [receiverContactList, senderContactList];
  const [receiversIndex, sendersIndex] = [0, 1];

  contactListsArr.forEach((contactList, i) => {
    if (!Array.isArray(contactList)) contactList = [];

    // Remove duplicate contacts
    contactList = contactList.filter(
      (contact) =>
        !(
          contact.users.includes(receiverID) && contact.users.includes(senderID)
        )
    );

    // Sets the new value of the contact as the first element i.e [0] using unshift.
    contactList?.unshift(updateData);
    if (contactList?.length > process.env.CONTACTLIST_LIMIT) contactList?.pop();

    if (i === receiversIndex)
      req.session[receiverContactSessionKey] = contactList;
    if (i === sendersIndex) req.session[senderContactSessionKey] = contactList;
  });
};
