const express = require('express');
const db = require('../PostgresDB');

const app = express();

const PORT = 3000;
app.listen(PORT, () => {console.log(`Listening on port ${PORT}`)});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API END-POINTS //

// get request to reviews
app.get('/api/reviews/', (req, res) => {
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const sort = req.query.sort || 'relevant';
  const product_id = req.query.product_id;

  const queryStirng = `SELECT * FROM reviews WHERE product_id = ${product_id}`;
  const queryArgs = [];
  db.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(results.rows);
    }
  })
});

// post request to reviews
app.post('/api/reviews', (req, res) => {
  const {} = req.body;
  const queryStirng = ``;
  const queryArgs = [];
  db.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.status(201);
    }
  })
})

// get request to reviews meta
app.get('/api/reviews/meta', (req, res) => {
  const product_id = req.query.product_id;

  const queryStirng = ``;
  const queryArgs = [];
  db.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(results)
    }
  })
})

// put request to update helpful
app.put('/api/reviews/:review_id/helpful', (req, res) => {
  const review_id = req.params.review_id

  const queryStirng = ``;
  const queryArgs = [];
  db.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204)
    }
  })
})

// put request to report review
app.put('/api/reviews/:review_id/report', (req, res) => {
  const review_id = req.params.review_id

  const queryStirng = ``;
  const queryArgs = [];
  db.query(queryStirng, queryArgs, (err, results) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(204)
    }
  })
})
