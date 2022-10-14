class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filetr() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };
    const excludedFields = ['limit', 'sort', 'page', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      const sortedBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortedBy);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }

  fieldlimition() {
    //3)Field Limitation
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    //4) Pagination
    const page = this.queryString.page * 1 || 1; // *1 = string => number
    const limit = this.queryString.limit * 1 || 100;
    const skipVal = (page - 1) * limit; //Page 1 = 1:10, page 2 = 11: 20, page 3 = 21:30

    this.query = this.query.skip(skipVal).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
