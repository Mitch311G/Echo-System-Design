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

  let sortby;
  if (sort === 'newest') {
    sortby = 'date';
  }

  if (sort === 'helpful') {
    sortby = 'helpfulness'
  }

  if (sort === 'relevant') {
    sortby = 'helpfulness'
  }

  const offset = (page - 1) * count;

  let response = {
    product: product_id,
    page: page,
    count: count,
  };

  const queryReviewStirng = `
    SELECT *,
      (SELECT
          COALESCE(json_agg(json_build_object('id', id, 'url', url)), '[]')
      FROM photos WHERE review_id = reviews.review_id)
    AS photos FROM reviews WHERE product_id = $1
    ORDER BY ${sortby} DESC
    LIMIT $2
    OFFSET $3`;
  const queryReviewArgs = [product_id, count, offset];
  pool
  .query(queryReviewStirng, queryReviewArgs)
    .then(result => {
      response.results = result.rows
    })
    .then(() => res.status(200).send(response))
    .catch(err => res.status(400).send(err))
};


// POST NEW REVIEW FUNCTION
 const postReview = (req, res) => {
  const { product_id, rating, summary, body, recommend, name, email, photos, characteristics } = req.body;
  const date = Date.now();

  // post mulitple photos
  async function postPhotos (review_id) {
    if (photos.length === 0) {return}

    for (let url of photos) {
      const queryPhotoStirng = 'INSERT INTO photos(review_id, url) VALUES ($1, $2)'
      const queryPhotoArgs = [review_id, url]
      await pool.query(queryPhotoStirng, queryPhotoArgs)
        .catch(err => res.status(400).send())
    }
  }

  // post mulitple characteristics
  async function postChars (review_id) {
    for (let characteristic_id in characteristics) {
      let value = characteristics[characteristic_id]
      const queryCharString = 'INSERT INTO characteristicReviews(characteristic_id, review_id, value) VALUES($1, $2, $3)';
      const queryCharArgs = [characteristic_id, review_id, value]
      await pool.query(queryCharString, queryCharArgs)
        .catch(err => res.status(400).send())
    }
  }

  // post a new review
  const queryReviewStirng = 'INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reviewer_name, reviewer_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING review_id';
  const queryReviewArgs = [product_id, rating, date, summary, body, recommend, name, email];
  pool.query(queryReviewStirng, queryReviewArgs)
    .then(results => {
      const { review_id } = results.rows[0]
      postPhotos(review_id);
      postChars(review_id);
    })
    .then(() => res.status(201).send())
    .catch(err => res.status(400).send())
};


// GET REVEIW META DATA FUNCTION
const getReviewMeta = (req, res) => {
  const { product_id } = req.query;

  const queryString = `SELECT json_build_object(
    'product_id', ${product_id}::TEXT,
    'ratings',
    (SELECT json_build_object(
      '1', (SELECT COUNT(rating) FROM reviews WHERE product_id = $1 AND rating = 1),
      '2', (SELECT COUNT(rating) FROM reviews WHERE product_id = $1 AND rating = 2),
      '3', (SELECT COUNT(rating) FROM reviews WHERE product_id = $1 AND rating = 3),
      '4', (SELECT COUNT(rating) FROM reviews WHERE product_id = $1 AND rating = 4),
      '5', (SELECT COUNT(rating) FROM reviews WHERE product_id = $1 AND rating = 5))),
    'recommended',
    (SELECT json_build_object(
      '0', (SELECT COUNT(recommend) FROM reviews WHERE product_id = $1 AND recommend = false),
      '1', (SELECT COUNT(recommend) FROM reviews WHERE product_id = $1 AND recommend = true))),
    'characteristics',
    (SELECT json_object_agg(name, json_build_object(
      'id', characteristic_id,
      'value', (SELECT AVG(value)::NUMERIC(10,4)::TEXT FROM characteristicReviews cr WHERE cr.characteristic_id=c.characteristic_id))) FROM characteristics c WHERE product_id = $1)
  )`;
  const queryArgs= [product_id];
  pool
    .query(queryString, queryArgs)
    .then((result) => res.status(200).send(result.rows[0].json_build_object))
    .catch(err => res.status(400).send(err))
};


// UPDATE HELPFUL FUNCTION
const updateHelpful = (req, res) => {
  const { review_id } = req.params;

  const queryStirng = 'UPDATE reviews SET helpfulness=helpfulness+1 WHERE review_id=$1';
  const queryArgs = [review_id];
  pool.query(queryStirng, queryArgs)
    .then(() => res.status(204).send())
    .catch(err => res.status(400).send())
};


// UPDATE REPORT FUNCTION
const updateReport = (req, res) => {
  const { review_id } = req.params;

  const queryStirng = 'UPDATE reviews SET reported=true WHERE review_id=$1 ';
  const queryArgs = [review_id];
  pool.query(queryStirng, queryArgs)
    .then(() => res.status(204).send())
    .catch(err => res.status(400).send())
};


module.exports = {
  getReviews,
  postReview,
  getReviewMeta,
  updateHelpful,
  updateReport
};
