// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configure CORS and JSON parsing middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/election", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a Mongoose schema and model for leave requests
const leaveRequestSchema = new mongoose.Schema({
  studentName: String,
  studentEmail: String,
  studentPhone: String,
  sickReason: String,
  additionalSymptoms: String,
  severity: String,
  coordinatorName: String,
  coordinatorEmail: String,
  className: String,
  leaveReason: String,
  expectedReturn: String,
  parentEmail: String,
  parentPhone: String,
  additionalComments: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

// Set up Socket.IO for real-time communication
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// API endpoint to create a new leave request
app.post("/api/leaveRequests", async (req, res) => {
  try {
    const newRequest = new LeaveRequest(req.body);
    const savedRequest = await newRequest.save();
    io.emit("newLeaveRequest", savedRequest);
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ message: "Error creating leave request", error });
  }
});

// API endpoint to fetch all leave requests
app.get("/api/leaveRequests", async (req, res) => {
  try {
    const requests = await LeaveRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests", error });
  }
});

// API endpoint to update a leave request's status
app.patch("/api/leaveRequests/:id", async (req, res) => {
  try {
    const updatedRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    io.emit("updateLeaveRequest", updatedRequest);
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: "Error updating leave request", error });
  }
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 8500;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
