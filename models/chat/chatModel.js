const mongoose = require('mongoose');
const {
  requestStatusEnum,
  defaultRequestStatus,
} = require('../../config/contactConfig');

const chatSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  reciever: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
  },
  contactRequest: {
    type: {
      isContactRequest: Boolean,
      isActivationChat: Boolean,
      status: {
        type: String,
        enum: {
          values: ['pending', 'accepted', 'declined'],
          message: 'Invalid contact request status.',
        },
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

chatSchema.index({ sender: 1, reciever: 1 });
// Create a compound unique index on sender and reciever
chatSchema.index(
  { sender: 1, reciever: 1, 'contactRequest.isActivationChat': 1 },
  { unique: true }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
