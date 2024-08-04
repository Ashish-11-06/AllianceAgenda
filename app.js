const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
const port = 8080;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const bcrypt = require('bcrypt');

app.post('/submit-form', async (req, res) => {
  const { firstname, lastname, email, phone_number, password, designation} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  pool.query(
    'INSERT INTO users (firstname, lastname, email, phone_number, password, designation) VALUES (?, ?, ?, ?, ?, ?)',
    [firstname, lastname, email, phone_number, hashedPassword, designation],
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

//  ------------------------------------------------------------------------------------------

app.get('/try', (req, res) => {
  res.render('try');
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
  res.render('tasks');
});

app.get('/communication', (req, res) => {
  res.render('communication');
});

// -----------------------------------------------------------------------------
// Endpoint to fetch announcements with user's name
app.get('/fetch-announcements', (req, res) => {
  const query = `
      SELECT 
          announcements.id, 
          announcements.title, 
          announcements.content, 
          users.firstName, 
          users.lastName, 
          DATE_FORMAT(CONVERT_TZ(announcements.createdAt, '+00:00', '+05:30'), '%Y-%m-%d %H:%i:%s') as createdAt
      FROM announcements
      INNER JOIN users ON announcements.createdBy = users.user_id
  `;
  pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching announcements:', err);
          return res.status(500).send('Failed to fetch announcements');
      }
      res.json(results);
  });
});


// /fetch by id
app.get('/fetch-announcements/:id', (req, res) => {
  const announcementId = req.params.id;

  const query = `
      SELECT 
      announcements.createdBy
      FROM announcements
      WHERE announcements.id = ?
  `;

  pool.query(query, [announcementId], (err, results) => {
      if (err) {
          console.error('Error fetching announcement:', err);
          return res.status(500).send('Failed to fetch announcement');
      }
      if (results.length === 0) {
          return res.status(404).send('Announcement not found');
      }
      res.json(results[0]); // Assuming you expect only one announcement with this ID
  });
});



// API to create a new announcement
app.post('/add-announcement', (req, res) => {
  const { title, content, createdBy } = req.body;
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const query = 'INSERT INTO announcements (title, content, createdBy, createdAt) VALUES (?, ?, ?, ?)';
  pool.query(query, [title, content, createdBy, createdAt], (err, results) => {
      if (err) throw err;
      res.send(results);
  });
});

// API to delete an announcement
app.delete('/delete-announcement/:id', (req, res) => {
  const announcementId = req.params.id;

  const query = 'DELETE FROM announcements WHERE id = ?';
  pool.query(query, [announcementId], (err, results) => {
    if (err) throw err;
    if (results.affectedRows === 0) {
      return res.status(404).send('Announcement not found');
    }
    res.send('Announcement deleted successfully');
  });
});
// -----------------------------------------------------------------------------
let tasks = [];

// Endpoint to fetch tasks
app.get('/fetch-task', (req, res) => {
  const selectQuery = `SELECT *, DATE_FORMAT(dueDate, '%Y-%m-%d') AS formattedDueDate FROM tasks`;
  pool.query(selectQuery, (err, results) => {
      if (err) {
          console.error('Error fetching tasks:', err.message);
          res.status(500).json({ error: 'Failed to fetch tasks' }); // Ensure JSON error response
      } else {
              res.json(results);
      }
  });
});


 
app.post('/task', (req, res) => {
  const { Ttitle, description, dueDate, priority, assigned_to, assigned_by } = req.body;
  if (!Ttitle || !dueDate || !priority) {
      return res.status(400).send('Title, dueDate, and priority are required');
  }

  const insertQuery = `INSERT INTO tasks (title, description, dueDate, priority, assigned_to, assigned_by) VALUES (?, ?, ?, ?, ?, ?)`;
  pool.query(insertQuery, [Ttitle, description, dueDate, priority, assigned_to, assigned_by], (err, result) => {
      if (err) {
          console.error('Error adding task:', err.message);
          res.status(500).send('Failed to add task');
      } else {
          res.status(201).send({ id: result.insertId, ...req.body });
      }
  });
});


// PUT route to update task status
app.put('/task/:id', (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  // Update status in MySQL database
  const updateQuery = `UPDATE tasks SET status = ? WHERE id = ?`;
  pool.query(updateQuery, [status, taskId], (err, result) => {
      if (err) {
          console.error('Error updating task status:', err.message);
          return res.status(500).send('Failed to update task status');
      }

      // Check if a row was affected
      if (result.affectedRows === 0) {
          return res.status(404).send('Task not found');
      }

      // Fetch the updated task from the database
      const selectQuery = `SELECT *, DATE_FORMAT(dueDate, '%Y-%m-%d') AS formattedDueDate FROM tasks WHERE id = ?`
      pool.query(selectQuery, [taskId], (err, rows) => {
          if (err) {
              console.error('Error fetching updated task:', err.message);
              return res.status(500).send('Failed to fetch updated task');
          }

          // Send the updated task as JSON response
          const updatedTask = rows[0];
          res.json(updatedTask);
      });
  });
});


app.delete('/task/:id', (req, res) => {
  const { id } = req.params;
  const deleteQuery = `DELETE FROM tasks WHERE id = ?`;

  pool.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error('Error deleting task:', err.message);
      res.status(500).json({ error: 'Failed to delete task' });
    } else {
      res.status(204).end();
    }
  });
});


// ----------------------------------------------------------------------------


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

      const user = results[0]; // Assuming `results` contains the user data
      const queryParams = new URLSearchParams({
        
          id: user.user_id,
          firstname: user.firstname,
          lastname: user.lastname,
          designation: user.designation,
          // Add other user data as needed
          // email: user.email,
          // age: user.age
      }).toString();
      res.redirect(`/welcomepage?${queryParams}`);
    }
  );
});



// -------------------------------------------------------------------------------

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


const convertToIST = (date) => {
  const IST_OFFSET = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
  const dateIST = new Date(date.getTime() + IST_OFFSET);
  return dateIST.toISOString().slice(0, 19).replace('T', ' ');
};



// Fetch messages including sender's full name
app.get('/messages', (req, res) => {
  const query = `
      SELECT m.*, CONCAT(u.user_id, ', ', u.firstName, ' ', u.lastName) AS fullName 
      FROM messages m 
      JOIN users u ON m.sender_id = u.user_id 
      ORDER BY m.sent_at`;
  
  pool.query(query, (err, result) => {
      if (err) {
          console.error('Error fetching messages:', err);
          res.status(500).json({ error: 'Error fetching messages' });
          return;
      }
      res.json(result);
  });
});

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('chat message', (data) => {
      const { sender_id, content } = data;
      if (!sender_id || !content) {
          console.error('Invalid message data:', data);
          return;
      }
      const currentTimestamp = new Date();
      const timestampIST = convertToIST(currentTimestamp);

      const insertMessageQuery = 'INSERT INTO messages (sender_id, content, sent_at) VALUES (?, ?, ?)';
      pool.query(insertMessageQuery, [sender_id, content, currentTimestamp], (err, result) => {
          if (err) {
              console.error('Error inserting message:', err);
              return;
          }

          const selectUserQuery = 'SELECT user_id, firstName, lastName FROM users WHERE user_id = ?';
          pool.query(selectUserQuery, [sender_id], (err, userResult) => {
              if (err) {
                  console.error('Error fetching user details:', err);
                  return;
              }
              const user = userResult[0];
              const fullName = `${user.user_id}, ${user.firstName}, ${user.lastName}`;

              data.sent_at = timestampIST;
              data.fullName = fullName;  // Add full name to the data
              io.emit('chat message', data);
          });
      });
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});

// ---------------------------------------------------------------------------

// Events Routes

// Fetch all events with creator's full name
app.get('/events', (req, res) => {
  const query = `
    SELECT e.*, CONCAT(u.firstname, ' ', u.lastname) AS created_by_name
    FROM events e
    JOIN users u ON e.created_by = u.user_id
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log('Retrieved events data:', results); 
    res.render('events', { events: results });
  });
});

// Add a new event
app.post('/events', (req, res) => {
  const { e_title, e_description, location, startTime, created_by } = req.body;

  const insertQuery = `
    INSERT INTO events (e_title, e_description, location, startTime, created_by) 
    VALUES (?, ?, ?, ?, ?)`;

  pool.query(insertQuery, [e_title, e_description, location, startTime, created_by], (err, result) => {
    if (err) {
      console.error('Error inserting event data:', err);
      res.status(500).send('Error inserting event');
      return;
    }
    console.log('event added succefully');
    res.redirect('/events');
  });
});

// Update an event
app.put('/events/:event_id', (req, res) => {
  const eventId = req.params.event_id;
  const { e_title, e_description, location, startTime } = req.body;

  const updateQuery = `
    UPDATE events 
    SET e_title = ?, e_description = ?, location = ?, startTime = ? 
    WHERE event_id = ?`;

  pool.query(updateQuery, [e_title, e_description, location, startTime, eventId], (err, result) => {
    if (err) {
      console.error('Error updating event data:', err);
      res.status(500).send('Error updating event');
      return;
    }

    res.redirect('/events');
  });
});

// Fetch event details by ID
app.get('/events/:event_id', (req, res) => {
  const eventId = req.params.event_id;

  // const selectQuery = 'SELECT * FROM events WHERE event_id = ?';
  const selectQuery  = `
  SELECT e.*, CONCAT(u.user_id, ' ',  u.firstname, ' ', u.lastname) AS created_by_name
  FROM events e
  JOIN users u ON e.created_by = u.user_id WHERE event_id = ?
`;
  pool.query(selectQuery, [eventId], (err, result) => {
    if (err) {
      console.error('Error fetching event details:', err);
      res.status(500).send('Error fetching event details');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('Event not found');
      return;
    }
    console.log(result);
    res.json(result[0]);
  });
});



// Delete an event
app.delete('/events/:event_id', (req, res) => {
  const eventId = req.params.event_id;

  const deleteQuery = 'DELETE FROM events WHERE event_id = ?';

  pool.query(deleteQuery, [eventId], (err, result) => {
    if (err) {
      console.error('Error deleting event:', err);
      res.status(500).send('Error deleting event');
      return;
    }

    console.log('Event deleted successfully.');
      res.status(200).send('Event deleted successfully.');
  });
});






// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
//    // Open the browser automatically
//    open(`http://localhost:${PORT}`);
// });

server.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // Use dynamic import to load the open module
  const open = await import('open');
  open.default(`http://localhost:${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });