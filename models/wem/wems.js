const mongoose = require('mongoose');

const wemSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: [Date],
  like: Number,
});

const Wems = mongoose.model('Wem', wemSchema);

module.exports = Wems;
