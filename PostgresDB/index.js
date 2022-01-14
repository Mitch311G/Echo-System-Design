const { Pool } = require('pg');

const pool = new Pool({
  user: 'Mitchell',
  host: 'localhost',
  database: 'ratingsandreviews',
  password:'',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    throw err
  } else {
    console.log('DB Connected!')
  }
});

const getReviews = (req, res) => {
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const sort = req.query.sort || 'relevant';
  const product_id = req.query.product_id;

  const queryStirng = `SELECT * FROM reviews WHERE product_id = ${product_id}`;
  const queryArgs = [];
  pool.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(results.rows);
    }
  });
};

const postReview = (req, res) => {
  const {} = req.body;
  const queryStirng = ``;
  const queryArgs = [];
  pool.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(201);
    }
  });
};

const getReviewMeta = (req, res) => {
  const product_id = req.query.product_id;

  const queryStirng = ``;
  const queryArgs = [];
  pool.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(results)
    }
  });
};

const updateHelpful = (req, res) => {
  const review_id = req.params.review_id

  const queryStirng = ``;
  const queryArgs = [];
  pool.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204)
    }
  });
};

const updateReport = (req, res) => {
  const review_id = req.params.review_id

  const queryStirng = ``;
  const queryArgs = [];
  pool.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204)
    }
  });
};

module.exports = {
  getReviews,
  postReview,
  getReviewMeta,
  updateHelpful,
  updateReport
};
