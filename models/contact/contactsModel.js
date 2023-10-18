const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: [Date],
});

const Contacts = mongoose.model('Contact', contactSchema);

module.exports = Contacts;
