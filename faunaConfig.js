// faunaConfig.js

const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
  secret: 'fnAFaODLafAAQJDpl9YnqGiUK53opJyOF40hMt9q',
  domain: 'db.fauna.com', // Change this if you are using a different FaunaDB domain
});

module.exports = {
  q,
  client,
};
