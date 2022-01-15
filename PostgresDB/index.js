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

// GET REVIEWS FUNCTION
const getReviews = (req, res) => {
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const sort = req.query.sort || 'relevant';
  const product_id = req.query.product_id;

  let response = {
    product: product_id,
    page: page,
    count: count,
  };

  async function getPhotos (reviews) {
    for(let review of reviews) {
      const id = review.review_id;
      const queryPhotoStirng = 'SELECT id, url FROM photos WHERE review_id=$1';
      const queryPhotoArgs = [id]
      await pool.query(queryPhotoStirng, queryPhotoArgs)
        .then(results => review['photos'] = results.rows)
        .catch(err => res.status(400).send(err))
    }
    return reviews
  }

  const queryReviewStirng = 'SELECT * FROM reviews WHERE product_id=$1 LIMIT $2';
  const queryReviewArgs = [product_id, count];
  pool.query(queryReviewStirng, queryReviewArgs)
    .then(results => getPhotos(results.rows))
    .then(reviews => response['results'] = reviews)
    .then(() => res.status(200).send(response))
    .catch(err => res.status(400).send(err))
  };

// POST NEW REVIEW FUNCTION
 const postReview = (req, res) => {
  const { product_id, rating, summary, body, recommend, name, email, photos, characteristics } = req.body;
  const date = Date.now();

  async function postPhotos (review_id) {
    if (photos.length === 0) {return}

    for (let url of photos) {
      const queryPhotoStirng = 'INSERT INTO photos(review_id, url) VALUES ($1, $2)'
      const queryPhotoArgs = [review_id, url]
      await pool.query(queryPhotoStirng, queryPhotoArgs)
        .catch(err => res.status(400))
    }
  }

  async function postChars (review_id) {
    for (let characteristic_id in characteristics) {
      let value = characteristics[characteristic_id]

      const queryCharString = 'INSERT INTO characteristicReviews(characteristic_id, review_id, value) VALUES($1, $2, $3)';
      const queryCharArgs = [characteristic_id, review_id, value]
      await pool.query(queryCharString, queryCharArgs)
        .catch(err => res.status(400))
    }
  }

  const queryReviewStirng = 'INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reviewer_name, reviewwer_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING review_id';
  const queryReviewArgs = [product_id, rating, date, summary, body, recommend, name, email];
  pool.query(queryReviewStirng, queryReviewArgs)
    .then(review_id => {
      postPhotos(review_id);
      postChars(review_id);
    })
    .then(() => res.status(204))
    .catch(err => res.status(400))
};

// GET REVEIW META DATA FUNCTION
const getReviewMeta = (req, res) => {
  const product_id = req.query.product_id;
  let response = {
    product: product_id,
  }

  const queryStirng = ``;
  const queryArgs = [];
  pool.query(queryStirng, queryArgs)
};

// UPDATE HELPFUL FUNCTION
const updateHelpful = (req, res) => {
  const review_id = req.params.review_id

  const queryStirng = 'UPDATE reviews SET helpfulness=helpfulness+1 WHERE review_id=$1';
  const queryArgs = [review_id];
  pool.query(queryStirng, queryArgs)
    .then(() => res.status(204))
    .catch(err => res.status(400).send(err))
};

// UPDATE REPORT FUNCTION
const updateReport = (req, res) => {
  const review_id = req.params.review_id

  const queryStirng = 'UPDATE reviews SET reported=true WHERE review_id=$1 ';
  const queryArgs = [review_id];
  pool.query(queryStirng, queryArgs)
    .then(() => res.status(204))
    .catch(err => res.status(400).send(err))
};

module.exports = {
  getReviews,
  postReview,
  getReviewMeta,
  updateHelpful,
  updateReport
};
