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
  const offset = (page - 1) * count;

  let response = {
    product: product_id,
    page: page,
    count: count,
  };

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
    .then(result => response.results = result.rows)
    .then(() => res.status(200).send(response))
    .catch(err => res.status(400).send(err))
};


// GET REVEIW META DATA FUNCTION
const getReviewMeta = (req, res) => {
  const { product_id } = req.query;

  const queryString = `
    SELECT json_build_object(
      'product_id', ${product_id}::TEXT,
      'ratings',
      (SELECT json_object_agg(rating, count) FROM ratings WHERE product_id = $1),
      'recommended',
      (SELECT json_object_agg(recommend, count) FROM recommended WHERE product_id = $1),
      'characteristics',
      (SELECT json_object_agg(name, json_build_object(
        'id', characteristic_id,
        'value', values::TEXT))
        FROM agg_characteristics WHERE product_id = $1)
    )`;
  const queryArgs= [product_id];
  pool
    .query(queryString, queryArgs)
    .then((result) => res.status(200).send(result.rows[0].json_build_object))
    .catch(err => res.status(400).send(err))
};


// POST NEW REVIEW FUNCTION
 const postReview = (req, res) => {
  const { product_id, rating, summary, body, recommend, name, email, photos, characteristics } = req.body;
  const date = Date.now();
  const photosString = JSON.stringify(photos).split('\"').join('\'');
  const characteristic_ids = JSON.stringify(Object.keys(characteristics)).split('\"').join('');
  const characteristic_values = JSON.stringify(Object.values(characteristics));

  const queryReviewStirng = `
    INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reviewer_name, reviewer_email)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING review_id`;
  const queryReviewArgs = [product_id, rating, date, summary, body, recommend, name, email];
  pool
    .query(queryReviewStirng, queryReviewArgs)
    .then(results => {
      const { review_id } = results.rows[0];

      const queryPhotoStirng = `INSERT INTO photos(review_id, url) VALUES ($1, unnest(ARRAY ${photosString}))`;
      const queryPhotoArgs = [review_id];
      pool
        .query(queryPhotoStirng, queryPhotoArgs)
        .catch(err => res.status(400).send())

      const queryCharString = `
        INSERT INTO characteristicReviews(characteristic_id, review_id, value)
        VALUES(unnest(ARRAY ${characteristic_ids}), $1, unnest(ARRAY ${characteristic_values}))`;
      const queryCharArgs = [review_id];
      pool
        .query(queryCharString, queryCharArgs)
        .catch(err => res.status(400).send())
    })
    .then(() => res.status(201).send())
    .catch(err => res.status(400).send())
};


// UPDATE HELPFUL FUNCTION
const updateHelpful = (req, res) => {
  const { review_id } = req.params;

  const queryStirng = 'UPDATE reviews SET helpfulness=helpfulness+1 WHERE review_id = $1';
  const queryArgs = [review_id];
  pool
    .query(queryStirng, queryArgs)
    .then(() => res.status(204).send())
    .catch(err => res.status(400).send())
};


// UPDATE REPORT FUNCTION
const updateReport = (req, res) => {
  const { review_id } = req.params;

  const queryStirng = 'UPDATE reviews SET reported=true WHERE review_id = $1';
  const queryArgs = [review_id];
  pool
    .query(queryStirng, queryArgs)
    .then(() => res.status(204).send())
    .catch(err => res.status(400).send())
};


module.exports = {
  getReviews,
  getReviewMeta,
  postReview,
  updateHelpful,
  updateReport
};
