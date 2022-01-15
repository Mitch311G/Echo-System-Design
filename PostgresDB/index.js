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

async function getReviews (req, res) {
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const sort = req.query.sort || 'relevant';
  const product_id = req.query.product_id;

  let response = {
    product: product_id,
    page: page,
    count: count,
  };

  let reviews;

  async function getPhotos (reviews) {
    for(let review of reviews) {
      const id = review.review_id;
      const queryStirng2 = 'SELECT id, url FROM photos WHERE review_id=$1';
      const queryArgs2 = [id]
      await pool.query(queryStirng2, queryArgs2)
        .then(results => review['photos'] = results.rows)
    }
    return reviews
  }

  const queryStirng = 'SELECT * FROM reviews WHERE product_id=$1 LIMIT $2';
  const queryArgs = [product_id, count];
  await pool.query(queryStirng, queryArgs)
    .then(results => getPhotos(results.rows))
    .then(reviews => response['results'] = reviews)
    .then(() => res.status(200).send(response))
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
  let response = {
    product: product_id,
  }

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

  const queryStirng = 'UPDATE reviews SET helpfulness=helpfulness+1 WHERE review_id=$1';
  const queryArgs = [review_id];
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

  const queryStirng = 'UPDATE reviews SET reported=true WHERE review_id=$1 ';
  const queryArgs = [review_id];
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
