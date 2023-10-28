const mongoose = require('mongoose');
const interestConfig = require('../../config/interestConfig');
const validateColor = require('validate-color').default;

const interestSchema = new mongoose.Schema(
  {
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
    topic: {
      type: String,
      lowercase: true,
      required: [true, 'No topic was specified for this interest.'],
    },
    interest: {
      type: String,
      lowercase: true,
      required: [true, 'No interest name was specified for this interest.'],
    },
    regions: {
      type: [
        {
          region: {
            type: String,
          },
          engagements: {
            type: {
              daily: {
                type: Number,
                default: 0,
              },
              weekly: {
                type: Number,
                default: 0,
              },
              monthly: {
                type: Number,
                default: 0,
              },
            },
            default: {
              daily: 0,
              weekly: 0,
              monthly: 0,
            },
          },
        },
      ],
      required: [true, 'Please specify a region for this interest'],
      default: interestConfig.DEFAULT_REGIONS(),
    },
    engagements: {
      type: {
        daily: {
          type: Number,
          default: 0,
        },
        weekly: {
          type: Number,
          default: 0,
        },
        monthly: {
          type: Number,
          default: 0,
        },
      },
      default: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

interestSchema.index({ interest: 1, topic: 1 }, { unique: true });

// Virtual totalEngagments property
// interestSchema.virtual('engagements').get(function () {
//   const engagements = this.regions.reduce(
//     (accumulator, region) => accumulator + region.engagements,
//     0
//   );

//   return engagements;
// });

interestSchema.pre('save', function (next) {
  // This manual assignment of engagements if for testing before Wems are designed. This should be done automatically on the begining of every day by querying all follow /public wems and setting the appropriate values
  this.engagements.daily = this.regions.reduce(
    (accumulator, region) => accumulator + region.engagements.daily,
    0
  );
  this.engagements.weekly = this.regions.reduce(
    (accumulator, region) => accumulator + region.engagements.weekly,
    0
  );
  this.engagements.monthly = this.regions.reduce(
    (accumulator, region) => accumulator + region.engagements.monthly,
    0
  );
  next();
});

const Interest = mongoose.model('Interest', interestSchema);

module.exports = Interest;
