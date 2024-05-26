// const express = require('express');
// const router = express.Router();

// // Display all events
// router.get('/', (req, res) => {
//     const query = 'SELECT * FROM events';
//     req.db.query(query, (err, results) => {
//         if (err) throw err;
//         res.render('events', { events: results });
//     });
// });

// // Create a new event
// router.post('/', (req, res) => {
//     const { e_title, e_description, location, startTime, created_by } = req.body;
//     const query = 'INSERT INTO events (e_title, e_description, location, startTime, created_by) VALUES (?, ?, ?, ?, ?)';
//     req.db.query(query, [e_title, e_description, location, startTime, created_by], (err, result) => {
//         if (err) throw err;
//         res.redirect('/events');
//     });
// });

// // Fetch single event details as JSON
// router.get('/:id', (req, res) => {
//     const query = 'SELECT * FROM events WHERE event_id = ?';
//     req.db.query(query, [req.params.id], (err, result) => {
//         if (err) throw err;
//         res.json(result[0]);
//     });
// });

// // Delete an event
// router.post('/:id/delete', (req, res) => {
//     const query = 'DELETE FROM events WHERE event_id = ?';
//     req.db.query(query, [req.params.id], (err, result) => {
//         if (err) throw err;
//         res.redirect('/events');
//     });
// });

// module.exports = router;
