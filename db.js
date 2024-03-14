const mysql = require('mysql2');
const fs = require('fs');

const pool = mysql.createPool({
  connectionLimit: 20000, // Adjust as needed
  host: 'mysql-3cf24693-surajmeshram7509-381c.a.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_KStmeX_-Gn1wX6cSMbM',
  database: 'ashishproject',
  port: 18484,
  ssl: {
    ca: fs.readFileSync('C:\\Users\\Suraj Meshram\\Desktop\\AllianceAgenda_COPY\\ca.pem'),           // Path to CA Certificate

  },

});


pool.getConnection((error, connection) => {
  if (error) {
    throw error;
  }

  console.log('Hello Suraj, Database is connected Successfully');

  // Release the connection back to the pool when done with it
  connection.release();
});


// pool.query(`select * from users`, function(err, result, fields) {
//   if (err) {
//       return console.log(err);
//   }
//   return console.log(result);
// })



// Function to fetch data from the database
function fetchData(callback) {
  pool.query('SELECT * FROM users', (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}



module.exports = pool;
