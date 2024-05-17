const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

const bcrypt = require('bcrypt');

app.post('/submit-form', async (req, res) => {
  const { firstname, lastname, email, phone_number, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  pool.query(
    'INSERT INTO users (firstname, lastname, email, phone_number, password) VALUES (?, ?, ?, ?, ?)',
    [firstname, lastname, email, phone_number, hashedPassword],
    (error, results) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.redirect('/login?error=Email%20already%20exists');
     
          // return res.status(400).send('Email already exists');
        }
        console.error('Error inserting data:', error);
        return res.status(500).send('Error inserting data');
      }
      console.log('Data inserted successfully');
      res.render('login', { success: 'User created successfully' });
    }
  );
});







app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  const error = req.query.error;
  const success = req.query.success;
  res.render('login', { error, success });
});

app.get('/displayData', (req, res) => {
  res.render('displayData');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});


app.get('/deleteRows', (req, res) => {
  res.render('deleteRows');
});

app.get('/welcomepage', (req, res) => {
  res.render('welcomepage');
});

app.get('/gallery', (req, res) => {
  res.render('gallery');
});

app.get('/task', (req, res) => {
  res.render('task');
});

app.get('/communication', (req, res) => {
  res.render('communication');
});

// app.get('/welcomepage.html', (req, res) => {
//   const { username } = req.query;
//   res.sendFile(__dirname + '/welcomepage.html');
// });
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


// LOGIN 

// Route for handling login form submission
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
        return res.status(401).send('Invalid email or password');
      }

      const username = results[0].firstname;
      res.redirect(`/welcomepage?username=${encodeURIComponent(username)}`);
    }
  );
});



// -------------------------------------------------------------------------------
// const storage = multer.memoryStorage(); // Store files in memory
// const upload = multer({ storage });
// const express = require('express');
// const pool = require('./db'); // Your MySQL connection pool

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Use in-memory storage

app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const fileData = req.file.buffer; // Get the binary data from the file
  const fileName = req.file.originalname; // Get the file name

  // Insert into MySQL
  pool.query(
    'INSERT INTO photos (name, data, mime_type) VALUES (?, ?, ?)',
    [fileName, fileData, req.file.mimetype], // Pass parameters in an array
    (error, results) => {
      if (error) {
        console.error('Error saving file to database:', error);
        return res.status(500).send('Error uploading file');
      }

      console.log(`File ${fileName} uploaded and saved to database`);
      // res.send('File uploaded and stored in database');
      res.status(201).json({ message: 'File uploaded successfully' });
    }
  );
});
// -----------------------------------------------------------------------------------------------------------
// Endpoint to retrieve a photo by ID
app.get('/photo/:id', (req, res) => {
  const photoId = parseInt(req.params.id); // Get the photo ID from the route and convert it to an integer

  // Query the database to find the photo with the specified ID
  pool.query(
    'SELECT data, mime_type FROM photos WHERE id = ?',
    [photoId], // Query parameter
    (error, results) => {
      if (error) {
        console.error('Error retrieving photo from database:', error);
        return res.status(500).send('Internal server error');
      }

      if (results.length === 0) {
        return res.status(404).send('Photo not found'); // No photo with the specified ID
      }

      const photo = results[0]; // Get the first result (only one expected)
      res.setHeader('Content-Type', photo.mime_type); // Set the content type based on the stored MIME type
      res.send(photo.data); // Send the binary data as the response
    }
  );
});
// ------------------------------------------------------------------------------------------------------------------------
// Endpoint to retrieve all photos
app.get('/photos', (req, res) => {
  // Query the database to get all photos
  pool.query(
    'SELECT id, name, data, mime_type FROM photos',
    (error, results) => {
      if (error) {
        console.error('Error retrieving photos from database:', error);
        return res.status(500).send('Internal server error');
      }

      if (results.length === 0) {
        return res.status(404).send('No photos found');
      }

      // Create an array to store the photo data
      const photos = results.map((row) => ({
        id: row.id,
        name: row.name,
        mime_type: row.mime_type,
        data: row.data.toString('base64'), // Convert binary data to base64
      }));

      res.json(photos); // Send the array as a JSON response
    }
  );
});
// ------------------------------------------------------------------------------------
// delete photo from gallery
// DELETE endpoint to delete a photo by ID in MySQL
app.delete('/photos/:id', (req, res) => {
  const photoId = parseInt(req.params.id, 10); // Convert ID to integer

  // SQL query to delete a photo by ID
  const query = 'DELETE FROM photos WHERE id = ?'; // Use '?' for parameterized queries
  const values = [photoId]; // Array of values for parameterized query

  // Execute the query
  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Error deleting photo:', error);
      return res.status(500).send('Internal server error'); // Error handling
    }

    if (result.affectedRows === 0) { // Check if any rows were deleted
      return res.status(404).send('Photo not found'); // If no rows were deleted
    }

    res.status(200).json({ message: 'Photo deleted successfully', id: photoId }); // Successful deletion
  });
});

// ===============================================================
// const express = require('express');
// const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');


const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Change this line to serve files from the 'pages' directory
app.use('/', express.static('pages'));

io.on('connection', (socket) => {
    console.log('User connected');
    // Listen for the 'message' event
    const convertToIST = (date) => {
      // Add 5 hours and 30 minutes to convert UTC to IST
      const IST_OFFSET = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
      const dateIST = new Date(date.getTime() + IST_OFFSET);
      return dateIST.toISOString().slice(0, 19).replace('T', ' ');
    };
    
 // for fetching old messages from database
app.get('/messages', (req, res) => {
  const { username } = req.query;
  const query = 'SELECT * FROM messages ORDER BY timestamp';
  pool.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: 'Error fetching messages' });
      return;
    }
    res.json(result);
  });
});
   
    socket.on('chat message', (data) => {
      const { username, message } = data;
      const currentTimestamp = new Date(); // UTC time
      const timestampIST = convertToIST(currentTimestamp); // Convert to IST
    
      const query = 'INSERT INTO messages (username, message, timestamp) VALUES (?, ?, ?)';
      pool.query(query, [username, message, timestampIST], (err, result) => {
        if (err) throw err;
        console.log(`Inserted message: ${message} from ${username} at ${timestampIST}`);
      });
    
      // Emit with IST timestamp
      data.timestamp = timestampIST;
      io.emit('chat message', data);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });