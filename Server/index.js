const express = require('express');
const db = require('../PostgresDB');

const app = express();

const PORT = 3000;
app.listen(PORT, () => {console.log(`Listening on port ${PORT}`)});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API END-POINTS //

// get request to reviews
app.get('/api/reviews/', db.getReviews);

// post request to reviews
app.post('/api/reviews', db.postReview);

// get request to reviews meta
app.get('/api/reviews/meta', db.getReviewMeta);

// put request to update helpful
app.put('/api/reviews/:review_id/helpful', db.updateHelpful)

// put request to report review
app.put('/api/reviews/:review_id/report', db.updateReport);

