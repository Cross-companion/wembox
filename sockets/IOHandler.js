const {
  deliveredStatus,
  seenStatus,
  defaultChatStatus,
} = require('../config/chatConfig');
const { getAndCacheUser } = require('../controllers/authController');
const AppError = require('../utilities/AppError');
const {
  parseCookies,
  getDecodedData,
  createChatRoomStr,
} = require('../utilities/helpers');
const { chatSent, updateChatStatus } = require('./chatSocket');
const { notificationSubIsSet } = require('./notificationSocket');

let BASE_IO;
class IOHandler {
  constructor(io) {
    BASE_IO = io;
    io.on('connection', async (socket) => {
      const jwtToken = parseCookies(socket?.handshake.headers.cookie)['jwt'];
      if (!jwtToken) return;

      const decoded = await getDecodedData(jwtToken);
      if (!decoded.id) return;

      decoded.id && socket.join(decoded.id);

      socket.user = await getAndCacheUser(decoded);
      const subIsSet = notificationSubIsSet(socket.user.subscription);
      if (!subIsSet) socket.emit('requestNotificationSubscription');

      socket.on('chatSent', (queryObj) => chatSent(socket, queryObj, io));

      socket.on('updateChatStatus', (queryObj) =>
        updateChatStatus(socket, queryObj)
      );

      socket.on('changeChatRoom', (queryObj) => {
        socket.leave(createChatRoomStr(queryObj?.leave, socket.user.id));
        if (!queryObj?.join || !socket.user.id) return;
        socket.join(createChatRoomStr(queryObj.join, socket.user.id));
      });
    });
  }

  deliverChats(req, res, next) {
    try {
      const { sentBy, chatData } = req.body;

      if (chatData?.newChat?.status !== defaultChatStatus)
        return next(
          new AppError('Invalid chat data @deliverChats/IOHandler.js', 400)
        );

      chatData.newChat.status = deliveredStatus;
      BASE_IO.to(sentBy).emit('chatProcessed', chatData);

      res.status(200).json({ status: 'success' });
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = IOHandler;
