const chatConfig = {
  chatStatusEnum: [
    'sent',
    'delivered',
    'seen',
    'deleted',
    'deleted for sender',
    'deleted for receiver',
  ],
  defaultChatStatus: 'sent',
  deliveredStatus: 'delivered',
  seenStatus: 'seen',
  deletedStatus: 'deleted',
  deletedForReceiverStatus: 'deleted for receiver',
  deletedForSenderStatus: 'deleted for sender',
  deletedMessageString: 'Deleted',
  chatsPerRequest: 100,
};

module.exports = chatConfig;
