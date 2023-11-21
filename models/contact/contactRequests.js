const mongoose = require('mongoose');

// const statusEnum = ['pending', 'accepted', 'declined']

const contactRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  reciever: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'declined'],
      message: 'Invalid contact request status.',
    },
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);

module.exports = ContactRequest;
