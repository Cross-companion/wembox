const multer = require('multer');
const Interest = require('../../models/interest/interestModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image!. Please upload only images.'), false);
  }
};

async function updateChosenAtSignup(topics = []) {
  try {
    await Interest.updateMany(
      { topic: { $in: topics } },
      { $inc: { chosenAtSignUp: 1 } }
    );
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { multerStorage, multerFilter, updateChosenAtSignup };
