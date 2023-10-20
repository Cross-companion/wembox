class APIFeature {
  constructor(query, queryString = {}) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const { page, sort, limit, fields, ...filteredQuery } = this.queryString;

    let queryStr = JSON.stringify(filteredQuery).split(' ').join();
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort(sortByStr) {
    if (this.queryString.sort || sortByStr) {
      const sortBy = sortByStr || this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }

    this.query = this.query;
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate(pageNum = 0, limitNum = 0) {
    const page = pageNum || this.queryString.page * 1 || 1;
    const limit = limitNum || this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeature;
