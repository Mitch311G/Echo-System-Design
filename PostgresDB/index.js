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

module.exports = pool
