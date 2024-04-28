const mysql = require('mysql2');
const fs = require('fs');

const pool = mysql.createPool({
  connectionLimit: 30000, // Adjust as needed
  host: 'mysql-311cd616-alliance-agenda-2024.a.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_VL5zdzgbMxp2CTae0nv',
  database: 'AllianceAgenda',
  // timezone: 'Asia/Kolkata',
  // timezone: '+05:30',
  port: 13776,
  ssl: {
    ca: fs.readFileSync('C:\\AllianceAgenda\\caAsh.pem'),           // Path to CA Certificate

  },

});


pool.getConnection((error, connection) => {
  if (error) {
    throw error;
  }

  console.log('Hello Ashish, Database is connected Successfully');

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
