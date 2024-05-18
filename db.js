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
  // const createTableQuery = `
  //   CREATE TABLE IF NOT EXISTS tasks (
  //     id INT AUTO_INCREMENT PRIMARY KEY,
  //     title VARCHAR(255) NOT NULL,
  //     description TEXT,
  //     dueDate DATE,
  //     priority ENUM('Low', 'Medium', 'High') NOT NULL,
  //     status ENUM('To-Do', 'Completed') DEFAULT 'To-Do',
  //     assigned_to VARCHAR(255),
  //     assigned_by VARCHAR(255)
  //   )
  // `;
  // connection.query(createTableQuery, (err, result) => {
  //   if (err) {
  //     console.error('Error creating table:', err.message);
  //   } else {
  //     console.log('Table "tasks" created successfully.');
  //   }
   
  // });

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
