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
  receiver: {
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
      isLastChat: Boolean,
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

chatSchema.index({ sender: 1, receiver: 1 });
// Create a compound unique index on sender and receiver
chatSchema.index(
  { sender: 1, receiver: 1, 'contactRequest.isActivationChat': 1 },
  { unique: true }
);

// Virtuals
chatSchema.virtual('populateSender', {
  ref: 'User',
  localField: 'sender',
  foreignField: '_id',
  justOne: true,
});

chatSchema.virtual('populateReceiver', {
  ref: 'User',
  localField: 'receiver',
  foreignField: '_id',
  justOne: true,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
