const catchAsync = require('../../utilities/catchAsync');
const { getContactsQuery } = require('../contact/helper');
const { populateManifest } = require('./helper');

exports.getAuthManifest = catchAsync(async (req, res, next) => {
  const manifest = populateManifest();
  res.json(manifest);
});

exports.getAppManifest = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const maxShortcuts = 5;
    const skipBy = 0;
    const contacts = await getContactsQuery(
      { users: userId },
      { userID: userId, contactsLimit: maxShortcuts, skipBy }
    );
    const shortcuts = contacts.map((contact) => {
      const {
        otherUser: { name, profileImage, note, frontEndUsername },
        _id: contactId,
      } = contact;

      return {
        name,
        url: `/?chats=${contactId}`,
        description:
          note || `Chat with ${name}(@${frontEndUsername}) on wembox inc`,
        icons: [
          {
            src: `${req.protocol}://${req.get('host')}${
              profileImage.startsWith('/') ? profileImage : '/' + profileImage
            }`,
            type: 'image/png',
            sizes: '500x500',
          },
        ],
      };
    });
    const manifest = populateManifest(shortcuts);
    res.json(manifest);
  } catch (err) {
    console.error(err);
    const BASE_MANIFEST = populateManifest();
    res.json(BASE_MANIFEST);
  }
});
