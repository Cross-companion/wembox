const mongoose = require('mongoose');
const interestConfig = require('../../config/interestConfig');
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
  regions: {
    type: [
      {
        region: {
          type: String,
        },
        engagement: Number,
      },
    ],
    required: [true, 'Please specify a region for this interest'],
    default: interestConfig.DEFAULT_REGIONS,
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

interestSchema.index({ topic: 1 });

const Interest = mongoose.model('Interest', interestSchema);

module.exports = Interest;
