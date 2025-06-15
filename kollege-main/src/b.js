import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/dc1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Mongoose schemas and models

// Booking schema – includes resource, date, time, duration, details, submittedBy, and status.
const bookingSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true },
    details: { type: String },
    submittedBy: { type: String, required: true },
    status: { type: String, default: 'Pending' },
  },
  { timestamps: true }
);

// Paper schema – for the PaperForm.
const paperSchema = new mongoose.Schema(
  {
    department: { type: String, required: true },
    paper: { type: String, required: true },
    year: { type: String, required: true },
    students: { type: Array, default: [] },
    semester: { type: String, required: true },
    teacher: { type: String, required: true },
  },
  { timestamps: true }
);

// Staff schema – to list teachers by department.
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
});

const Booking = mongoose.model('Booking', bookingSchema);
const Paper = mongoose.model('Paper', paperSchema);
const Staff = mongoose.model('Staff', staffSchema);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins; adjust as needed.
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes

// Get all bookings
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new booking
app.post('/bookings', async (req, res) => {
  try {
    // Create booking with status "Pending"
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    // Emit the new booking event to all connected clients
    io.emit('newBooking', savedBooking);
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status – e.g., when a user approves or rejects a booking.
app.patch('/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (updatedBooking) {
      io.emit('bookingUpdated', updatedBooking);
      res.json(updatedBooking);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get staff list for a specific department (used in PaperForm)
app.get('/staff/list/:department', async (req, res) => {
  try {
    const department = req.params.department;
    const staff = await Staff.find({ department });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new paper record (from PaperForm)
app.post('/paper', async (req, res) => {
  try {
    const newPaper = new Paper(req.body);
    await newPaper.save();
    res.status(201).json({ message: 'Paper added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server on port 6000
server.listen(6000, () => {
  console.log('Server listening on port 6000');
});
