const express = require('express');
const db = require('../PostgresDB');

const app = express();

const PORT = 3000;
app.listen(PORT, () => {console.log(`Listening on port ${PORT}`)});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API End-points //

// get request to reviews
app.get('/api/reviews/', (req, res) => {
  let queryStirng = 'SELECT * FROM reviews WHERE product_id = 44388';
  let queryArgs = [];
  db.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(results)
    }
  })
});

// post request to reviews
app.post('/api/reviews', (req, res) => {
  //query DB
})

// get request to reviews meta
app.get('/api/reviews/meta', (req, res) => {
  //query DB
})

// put request to update helpful
app.put('/api/reviews/:review_id/helpful', (req, res) => {
  //query DB
})

// put request to report review
app.put('/api/reviews/:review_id/report', (req, res) => {
  //query DB
})
