const mongoose = require('mongoose');
const {
  statusEnum,
  defaultStatus,
  notificationTypesEnum,
} = require('../../config/notificationConfig');

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A notification must have a sender.'],
    },
    for: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A notification must have an owner'],
    },
    message: {
      type: mongoose.Schema.ObjectId,
      ref: 'Chat',
    },
    status: {
      type: String,
      enum: {
        values: statusEnum,
        message: 'Invalid notification status.',
      },
      default: defaultStatus,
    },
    notificationType: {
      type: String,
      enum: notificationTypesEnum,
      required: [true, 'A notification must have a type.'],
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

notificationSchema.index({
  sender: 1,
  for: 1,
  createdAt: 1,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
