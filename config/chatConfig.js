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
  getPossiblePrevStatus(status) {
    switch (status) {
      case this.defaultChatStatus:
        return [];
      case this.deliveredStatus:
        return [this.defaultChatStatus];
      case this.seenStatus:
        return [this.defaultChatStatus, this.deliveredStatus];
      default:
        return [];
    }
  },
};

module.exports = chatConfig;
