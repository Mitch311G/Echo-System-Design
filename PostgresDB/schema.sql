-- For Development:
-- DROP DATABASE IF EXISTS ratingsandreviews;

CREATE DATABASE ratingsandreviews;

\c ratingsandreviews;

-- Create reviews table
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

-- Load Reviews table
COPY reviews
FROM '/Users/Mitchell/Documents/Galvanize/SDC/reviews.csv'
DELIMITER ','
CSV HEADER;

-- Create photos table
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  review_id INT,
  url VARCHAR(1000),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id)
);

-- Load photos table
COPY photos
FROM '/Users/Mitchell/Documents/Galvanize/SDC/reviews_photos.csv'
DELIMITER ','
CSV HEADER;

-- Create characteristics table
CREATE TABLE characteristics (
  characteristic_id SERIAL PRIMARY KEY,
  product_id INT,
  name VARCHAR(50)
);

-- Load characteristics table
COPY characteristics
FROM '/Users/Mitchell/Documents/Galvanize/SDC/characteristics.csv'
DELIMITER ','
CSV HEADER;

-- Create charachteristicReviews table
CREATE TABLE characteristicReviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INT,
  review_id INT,
  value INT,
  FOREIGN KEY (characteristic_id) REFERENCES characteristics(characteristic_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id)
);

-- Load charachteristicReviews table
COPY characteristicReviews
FROM '/Users/Mitchell/Documents/Galvanize/SDC/characteristic_reviews.csv'
DELIMITER ','
CSV HEADER;

-- Agg tables
CREATE TABLE ratings AS
SELECT product_id, rating, count(rating)
FROM reviews
GROUP BY product_id, rating;

CREATE TABLE recommended AS
SELECT product_id, recommend, count(recommend)
FROM reviews
GROUP BY product_id, recommend;

CREATE TABLE agg_characteristics AS
SELECT characteristic_id, product_id, name,
  (SELECT AVG(value)::NUMERIC(10, 4)
  FROM characteristicReviews cr
  WHERE cr.characteristic_id = c.characteristic_id)
AS values
FROM characteristics c
GROUP BY characteristic_id, product_id, name;

ALTER TABLE ratings ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE recommended ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE agg_characteristics ADD PRIMARY KEY(characteristic_id);

-- Adjust sequence value after inserting data from csv documents
SELECT SETVAL('reviews_review_id_seq', (SELECT MAX(review_id) FROM reviews));
SELECT SETVAL('photos_id_seq', (SELECT MAX(id) FROM photos));
SELECT SETVAL('characteristicReviews_id_seq', (SELECT MAX(id) FROM characteristicReviews));

-- Add indexes to frequently used constraints when querying
CREATE INDEX reviews_product_id_index ON reviews (product_id);
CREATE INDEX photos_review_id_index ON photos (review_id);
-- CREATE INDEX characteristicReviews_characteristic_id_index ON characteristicReviews (characteristic_id);
-- DROP INDEX characteristicReviews_characteristic_id_index ** after agg_characteristics has been created
CREATE INDEX ratings_product_id_index ON ratings (product_id);
CREATE INDEX recommended_product_id_index ON recommended (product_id);
CREATE INDEX agg_characteristics_product_id_index ON agg_characteristics (product_id);
