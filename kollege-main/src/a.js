// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server and integrate with Socket.IO.
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

// Connect to MongoDB.
mongoose.connect('mongodb://localhost:27017/election', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the booking schema and model.
const bookingSchema = new mongoose.Schema({
  resource: String,
  date: String,
  time: String,
  duration: Number,
  details: String,
  submittedBy: String,
  status: { type: String, default: 'Pending' },
  submissionDate: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// GET /bookings - retrieve all bookings.
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ submissionDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /bookings - create a new booking.
app.post('/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    io.emit('newBooking', booking);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /bookings/:id - update a booking (e.g. status update).
app.patch('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (booking) {
      io.emit('bookingUpdated', booking);
      res.json(booking);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Setup Socket.IO connection.
io.on('connection', (socket) => {
  console.log('Client connected: ' + socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
  });
});

// Start the server.
const PORT = 5500;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
