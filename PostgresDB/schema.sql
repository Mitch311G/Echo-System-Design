DROP DATABASE IF EXISTS ratingsAndReviews;

CREATE DATABASE ratingsAndReviews;

\c ratingsAndReviews;

CREATE TABLE products(
  product_id SERIAL PRIMARY KEY,
  page INT,
);

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  product_id INT,
  rating INT,
  summary VARCHAR(60),
  recommend BOOLEAN,
  response VARCHAR(1000),
  body VARCHAR(1000),
  date DATE,
  reviewer_name VARCHAR (50),
  helpfulness INT,
  reported BOOLEAN,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  review_id INT,
  url VARCHAR(1000),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id)
);

CREATE TABLE ratings (
  rating_id SERIAL PRIMARY KEY,
  product_id INT,
  1 INT,
  2 INT,
  3 INT,
  4 INT,
  5 INT,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE recommended (
  recommended_id SERIAL PRIMARY KEY,
  product_id INT,
  0 INT,
  1 INT,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE characteristics (
  characteristic_id SERIAL PRIMARY KEY,
  product_id INT,
  name VARCHAR(50),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE characteristicRatings (
  char_rating_id SERIAL PRIMARY KEY,
  characteristic_id INT,
  value DECIMAL,
  FOREIGN KEY (characteristic_id) REFERENCES characteristics(characteristic_id)
);

The reason for choosing the SQL database is two fold. First, the data we will be give/use in this project will require many relationships and complex queries. For that, relational databases are best to keep track of relationships and easily perform complex queries across multiple talbes. Second, the data we will store has many different data types and SQL databases make it easy to store, read, and write many different data types.