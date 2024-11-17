const { getAndCacheUser } = require('../controllers/authController');
const {
  parseCookies,
  getDecodedData,
  createChatRoomStr,
} = require('../utilities/helpers');
const { chatSent, updateChatStatus } = require('./chatSocket');
const { notificationSubIsSet } = require('./notificationSocket');

class IOHandler {
  constructor(io) {
    io.on('connection', (socket) => {
      const jwtToken = parseCookies(socket?.handshake.headers.cookie)['jwt'];
      if (jwtToken)
        getDecodedData(jwtToken).then(async (decoded) => {
          if (!decoded.id) return;
          decoded.id && socket.join(decoded.id);
          socket.user = await getAndCacheUser(decoded);
          const subIsSet = notificationSubIsSet(socket.user.subscription);
          if (!subIsSet) socket.emit('requestNotificationSubscription');
        });

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
}

module.exports = IOHandler;
