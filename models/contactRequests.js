const mongoose = require('mongoose');

const contactRequestsSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: [Date],
});
