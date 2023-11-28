const chatConfig = {
  chatStatusEnum: [
    'sent',
    'delivered',
    'seen',
    'deleted',
    'deleted for sender',
  ],
  defaultChatStatus: 'sent',
  deliveredStatus: 'delivered',
  seenStatus: 'seen',
  deletedStatus: 'deleted',
  deletedForSenderStatus: 'deleted for sender',
};

module.exports = chatConfig;
