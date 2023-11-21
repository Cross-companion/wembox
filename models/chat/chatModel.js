const mongoose = require('mongoose');

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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
