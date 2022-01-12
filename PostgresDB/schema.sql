DROP DATABASE IF EXISTS ratingsAndReviews;

CREATE DATABASE ratingsAndReviews;

\c ratingsAndReviews;

CREATE TABLE products(
  product_id SERIAL PRIMARY KEY,
  name VARCHAR(50)
);

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  product_id INT,
  rating INT,
  date DATE,
  summary VARCHAR(60),
  body VARCHAR(1000),
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name VARCHAR (50),
  reviewer_email VARCHAR (50),
  response VARCHAR(1000),
  helpfulness INT,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  review_id INT,
  url VARCHAR(1000),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id)
);

-- CREATE TABLE ratings (
--   rating_id SERIAL PRIMARY KEY,
--   product_id INT,
--   1 INT,
--   2 INT,
--   3 INT,
--   4 INT,
--   5 INT,
--   FOREIGN KEY (product_id) REFERENCES products(product_id)
-- );

-- CREATE TABLE recommended (
--   recommended_id SERIAL PRIMARY KEY,
--   product_id INT,
--   0 INT,
--   1 INT,
--   FOREIGN KEY (product_id) REFERENCES products(product_id)
-- );

CREATE TABLE characteristics (
  characteristic_id SERIAL PRIMARY KEY,
  product_id INT,
  name VARCHAR(50),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE characteristicReviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INT,
  review_id INT,
  value INT,
  FOREIGN KEY (characteristic_id) REFERENCES characteristics(characteristic_id)
  FOREIGN KEY (reveiw_id) REFERENCES reviews(review_id)
);

