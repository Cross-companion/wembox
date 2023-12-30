const isNew = (createdAt, minutes = 10) => {
  const minMinutes = Date.now() - minutes * 60 * 1000;
  const isNew = new Date(createdAt).getTime() > minMinutes;
  return isNew;
};
module.exports = { isNew };
