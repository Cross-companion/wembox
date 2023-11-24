const mongoose = require('mongoose');
const {
  requestStatusEnum,
  defaultRequestStatus,
} = require('../../config/contactConfig');

const chatSchema = new mongoose.Schema({
  senderID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  receiverID: {
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

chatSchema.index({ senderID: 1, receiverID: 1 });
// Create a compound unique index on sender and receiver
chatSchema.index(
  { senderID: 1, receiverID: 1, 'contactRequest.isActivationChat': 1 },
  { unique: true }
);

// Virtuals
chatSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderID',
  foreignField: '_id',
  justOne: true,
});

chatSchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverID',
  foreignField: '_id',
  justOne: true,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
