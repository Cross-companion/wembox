exports.notificationSubIsSet = function (sub) {
  try {
    const { endpoint, keys } = sub;
    let subIsSet = endpoint && keys?.p256dh && keys?.auth ? true : false;

    return subIsSet;
  } catch {
    return false;
  }
};
