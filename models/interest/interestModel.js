const mongoose = require('mongoose');
const validateColor = require('validate-color').default;

const interestSchema = new mongoose.Schema({
  interest: {
    type: String,
    lowercase: true,
    required: [true, 'A user interest must have a name.'],
    unique: [true, 'A user interest must be unique name.'],
  },
  topic: {
    type: String,
    lowercase: true,
    required: [true, 'No topic was specified for this interest.'],
  },
  themeColor: {
    type: String,
    lowercase: true,
    validate: {
      validator: function (value) {
        // Validate that the string recieved is a valid color.
        return validateColor(value);
      },
    },
    default: '#ffffff',
  },
  chosenAtSignUp: {
    type: Number,
    default: 0,
  },
});

const Interest = mongoose.model('Interest', interestSchema);

module.exports = Interest;
