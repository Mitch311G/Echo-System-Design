DROP DATABASE IF EXISTS ratingsandreviews;

CREATE DATABASE ratingsandreviews;

\c ratingsandreviews;

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  product_id INT,
  rating INT,
  date BIGINT,
  summary VARCHAR(200),
  body VARCHAR(1000),
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name VARCHAR (50),
  reviewer_email VARCHAR (50),
  response VARCHAR(1000) DEFAULT NULL, --might need to add default null (to avoid 'null' as string)
  helpfulness INT
);

COPY reviews
FROM '/Users/Mitchell/Documents/Galvanize/SDC/reviews.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  review_id INT,
  url VARCHAR(1000),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id)
);

COPY photos
FROM '/Users/Mitchell/Documents/Galvanize/SDC/reviews_photos.csv'
DELIMITER ','
CSV HEADER;

-- this would be an agg table
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

-- this would be an agg table
-- CREATE TABLE recommended (
--   recommended_id SERIAL PRIMARY KEY,
--   product_id INT,
--   notRecommendedCount INT,
--   RecommendedCount INT,
--   FOREIGN KEY (product_id) REFERENCES products(product_id)
-- );

CREATE TABLE characteristics (
  characteristic_id SERIAL PRIMARY KEY,
  product_id INT,
  name VARCHAR(50)
);

COPY characteristics
FROM '/Users/Mitchell/Documents/Galvanize/SDC/characteristics.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE characteristicReviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INT,
  review_id INT,
  value INT,
  FOREIGN KEY (characteristic_id) REFERENCES characteristics(characteristic_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id)
);

COPY characteristicReviews
FROM '/Users/Mitchell/Documents/Galvanize/SDC/characteristic_reviews.csv'
DELIMITER ','
CSV HEADER;
