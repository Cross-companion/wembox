module.exports = (fn) => {
  return (req, res, next, queryOptions) => {
    fn(req, res, next).catch(next);
  };
};
