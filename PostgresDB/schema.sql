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

-- Adjust sequence value after inserting data from csv documents
SELECT SETVAL('reviews_review_id_seq', (SELECT MAX(review_id) FROM reviews));
SELECT SETVAL('photos_id_seq', (SELECT MAX(id) FROM photos));
SELECT SETVAL('characteristicReviews_id_seq', (SELECT MAX(id) FROM characteristicReviews));

-- Add indexes to frequently used constraints when querying
CREATE INDEX reviews_product_id_index ON reviews (product_id);
CREATE INDEX photos_review_id_index ON photos (review_id);
CREATE INDEX reviews_rating_index ON reviews (rating);
CREATE INDEX reviews_recommend_index ON reviews (recommend);
CREATE INDEX characteristicReviews_characteristic_id_index ON characteristicReviews (characteristic_id);
CREATE INDEX characteristics_product_id_index ON characteristics (product_id);

