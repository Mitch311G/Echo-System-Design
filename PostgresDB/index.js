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

  // get review photos
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

  // get reviews then get photos
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

  // post mulitple photos
  async function postPhotos (review_id) {
    if (photos.length === 0) {return}

    for (let url of photos) {
      const queryPhotoStirng = 'INSERT INTO photos(review_id, url) VALUES ($1, $2)'
      const queryPhotoArgs = [review_id, url]
      await pool.query(queryPhotoStirng, queryPhotoArgs)
        .catch(err => res.status(400).send(err))
    }
  }

  // post mulitple characteristics
  async function postChars (review_id) {
    for (let characteristic_id in characteristics) {
      let value = characteristics[characteristic_id]

      const queryCharString = 'INSERT INTO characteristicReviews(characteristic_id, review_id, value) VALUES($1, $2, $3)';
      const queryCharArgs = [characteristic_id, review_id, value]
      await pool.query(queryCharString, queryCharArgs)
        .catch(err => res.status(400).send(err))
    }
  }

  // post a new review
  const queryReviewStirng = 'INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reviewer_name, reviewwer_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING review_id';
  const queryReviewArgs = [product_id, rating, date, summary, body, recommend, name, email];
  pool.query(queryReviewStirng, queryReviewArgs)
    .then(review_id => {
      postPhotos(review_id);
      postChars(review_id);
    })
    .then(() => res.status(204).send())
    .catch(err => res.status(400))
};

// GET REVEIW META DATA FUNCTION
async function getReviewMeta (req, res) {
  const product_id = req.query.product_id;
  let response = {
    product_id: product_id,
    ratings: {},
    recommended: {},
    characteristics: {}
  }

  // ratings counts
  for (let i = 1; i <= 5; i++) {
    const queryRatingsStirng = 'SELECT COUNT(rating) FROM reviews WHERE product_id=$1 AND rating=$2';
    const queryRatingsArgs = [product_id, i];
    await pool.query(queryRatingsStirng, queryRatingsArgs)
      .then(results => response.ratings[i] = Number(results.rows[0].count))
      .catch(err => res.status(400).send(err))
  }

  // recommended counts
  async function getRecommendedCount (recommend) {
    const queryRecommendString = 'SELECT COUNT(recommend) FROM reviews WHERE product_id=$1 AND recommend=$2';
    const queryRecommendArgs = [product_id, recommend];
    await pool.query(queryRecommendString, queryRecommendArgs)
      .then(results => response.recommended[recommend] = Number(results.rows[0].count))
      .catch(err => res.status(400).send(err))
  }

  await getRecommendedCount(true);
  await getRecommendedCount(false);

  // get avg characteristic rating
  async function getAvgCharReview (chartics) {
    let allChars = {};
    for(let chartic of chartics) {
      const { characteristic_id, name } = chartic;
      const queryCharReviewsString = 'SELECT AVG(value)::numeric(10,4) FROM characteristicReviews WHERE characteristic_id=$1';
      const queryCharReviewArgs = [characteristic_id];
      await pool.query(queryCharReviewsString, queryCharReviewArgs)
        .then(results => allChars[name] = {id: characteristic_id, value: results.rows[0].avg})
        .catch(err => res.status(400).send(err))
    }
    return allChars;
  }

  // get characteristics
  const queryCharString = 'SELECT characteristic_id, name FROM characteristics WHERE product_id=$1';
  const queryCharArgs = [product_id]
  await pool.query(queryCharString, queryCharArgs)
    .then(results => getAvgCharReview(results.rows))
    .then(allChars => response.characteristics = allChars)
    .catch(err => res.status(400).send(err))


  res.status(200).send(response)

};

// UPDATE HELPFUL FUNCTION
const updateHelpful = (req, res) => {
  const review_id = req.params.review_id

  const queryStirng = 'UPDATE reviews SET helpfulness=helpfulness+1 WHERE review_id=$1';
  const queryArgs = [review_id];
  pool.query(queryStirng, queryArgs)
    .then(() => res.status(204).send())
    .catch(err => res.status(400).send(err))
};

// UPDATE REPORT FUNCTION
const updateReport = (req, res) => {
  const review_id = req.params.review_id

  const queryStirng = 'UPDATE reviews SET reported=true WHERE review_id=$1 ';
  const queryArgs = [review_id];
  pool.query(queryStirng, queryArgs)
    .then(() => res.status(204).send())
    .catch(err => res.status(400).send(err))
};

module.exports = {
  getReviews,
  postReview,
  getReviewMeta,
  updateHelpful,
  updateReport
};
