const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// // Define a route handler for the root path
// app.get('/login-page', (req, res) => {
//   // Use 'path' module to get the absolute path to the HTML file
//   const indexPath = path.join(__dirname, 'login.html');
  
//   // Serve the HTML file
//   res.sendFile(indexPath);
// });




app.post('/submit-form', (req, res) => {
  const { firstname, lastname, email, phone_number, password } = req.body;

  pool.query(
    'INSERT INTO users (firstname, lastname, email, phone_number, password) VALUES (?, ?, ?, ?, ?)',
    [firstname, lastname, email, phone_number, password],
    (error, results) => {
      if (error) {
        console.error('Error inserting data:', error);
        res.status(500).send('Error inserting data');
      } else {
        console.log('Data inserted successfully');
        // Do not send a response here; let the redirect handle the response
        res.redirect('/dashboard.html');
      }
    }
  );
});








app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/login.html', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/displayData.html', (req, res) => {
  res.sendFile(__dirname + '/displayData.html');
});



app.get('/dashboard.html', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});


app.get('/deleteRows.html', (req, res) => {
  res.sendFile(__dirname + '/deleteRows.html');
});



// pool.query(`select * from users`, function(err, result, fields) {
//   if (err) {
//       return console.log(err);
//   }
//   return console.log(result);
// })



app.get('/fetch-data', (req, res) => {
  const query = 'SELECT * FROM users'; 

  // Perform the database query
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the results as JSON
    res.json(results);
  });
});

// Inside the /delete-rows endpoint
app.post('/delete-rows', (req, res) => {
  const { ids } = req.body;

  console.log('Received IDs for deletion:', ids);

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'Invalid or empty list of IDs' });
    return;
  }

  const deleteQuery = 'DELETE FROM users WHERE id IN (?)'; // Replace with your actual table name

  db.query(deleteQuery, [ids], (err, results) => {
    if (err) {
      console.error('Error executing MySQL delete query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json({ success: true, message: 'Rows deleted successfully' });
  });
});







app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});









