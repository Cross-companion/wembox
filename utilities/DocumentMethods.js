const User = require('../models/user/userModel');

/**
 * This function contains methods for Models. It is useful if documents from a model is cache. (Because caching strips the cached object of all its methods)
 */
class DocumentMethods {
  /**
   * Even though `user.passwordChangedAt` is by default stored by as a date type,  it is reconverted to a date again here because when a user data is cached, all data is stored as a string.
   */
  isPasswordChanged(user, JWTTimestamp, Model = User) {
    const passwordChangedAt = user.passwordChangedAt;
    user.passwordChangedAt = new Date(passwordChangedAt);
    Model.schema.methods.isPasswordChanged.call(user, JWTTimestamp);
  }
}

module.exports = new DocumentMethods();
