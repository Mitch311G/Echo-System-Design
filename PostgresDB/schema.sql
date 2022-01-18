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
  response VARCHAR(1000) DEFAULT NULL,
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

-- Add indexes to frequently used constraints when querying
CREATE INDEX reviews_product_id_index ON reviews (product_id);
CREATE INDEX photos_review_id_index ON photos (review_id);
CREATE INDEX reviews_rating_index ON reviews (rating);
CREATE INDEX reviews_recommend_index ON reviews (recommend);
CREATE INDEX characteristicReviews_characteristic_id_index ON characteristicReviews (characteristic_id);
CREATE INDEX characteristics_product_id_index ON characteristics (product_id);


SELECT json_build_object(
    'product_id', 3,
    'ratings',
    (SELECT json_build_object(
      '1', (SELECT COUNT(rating) FROM reviews WHERE product_id = 3 AND rating = 1),
      '2', (SELECT COUNT(rating) FROM reviews WHERE product_id = 3 AND rating = 2),
      '3', (SELECT COUNT(rating) FROM reviews WHERE product_id = 3 AND rating = 3),
      '4', (SELECT COUNT(rating) FROM reviews WHERE product_id = 3 AND rating = 4),
      '5', (SELECT COUNT(rating) FROM reviews WHERE product_id = 3 AND rating = 5))),
    'recommended',
    (SELECT json_build_object(
      '0', (SELECT COUNT(recommend) FROM reviews WHERE product_id = 3 AND recommend = 'false'),
      '1', (SELECT COUNT(recommend) FROM reviews WHERE product_id = 3 AND recommend = 'true'))),
    'characteristics',
    (SELECT json_object_agg(name, json_build_object(
      'id', characteristic_id,
      'value', (SELECT AVG(value)::numeric(10,4) FROM characteristicReviews cr WHERE cr.characteristic_id=c.characteristic_id))) FROM characteristics c WHERE product_id = 3)
  )