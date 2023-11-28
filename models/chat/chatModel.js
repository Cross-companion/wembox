const mongoose = require('mongoose');
const {
  requestStatusEnum,
  defaultRequestStatus,
} = require('../../config/contactConfig');
const {
  chatStatusEnum,
  defaultChatStatus,
  deliveredStatus,
} = require('../../config/chatConfig');

const chatSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: {
        values: chatStatusEnum,
        message: 'Invalid chat status.',
      },
      default: defaultChatStatus,
    },
    contactRequest: {
      type: {
        isContactRequest: Boolean,
        isActivationChat: Boolean,
        isLastChat: Boolean,
        status: {
          type: String,
          enum: {
            values: requestStatusEnum,
            message: 'Invalid contact request status.',
          },
        },
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

chatSchema.index({
  sender: 1,
  receiver: 1,
  createdAt: 1,
  'contactRequest.isActivationChat': 1,
  'contactRequest.status': 1,
});

chatSchema.pre('save', async function (next) {
  this.status = deliveredStatus;

  next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
