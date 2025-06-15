
// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 4500;

// Global Middleware
app.use(cors());
app.use(express.json());

// Complaint Schema & Model
const complaintSchema = new mongoose.Schema({
  text: { type: String, required: true },
  domain: { type: String, required: true },
  priority: { type: String, required: true },
  // The student's actual name (visible to teachers)
  studentNameActual: { type: String, default: "Anonymous" },
  // The name that will be publicly displayed (always "Anonymous" for student view)
  studentNamePublic: { type: String, default: "Anonymous" },
  // Teacher details when resolving a complaint
  teacherName: { type: String },
  teacherStatement: { type: String },
  status: { type: String, default: "Pending" },
  trackingId: { type: String, required: true },
  submissionDate: { type: Date, default: Date.now }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

// POST /complaints - Submit a new complaint
app.post("/complaints", async (req, res) => {
  try {
    const { text, domain, priority, studentNameActual, isAnonymous } = req.body;
    const trackingId = "TPC" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const complaint = new Complaint({
      text,
      domain,
      priority,
      studentNameActual,
      // For public view, if anonymous then show "Anonymous"
      studentNamePublic: isAnonymous ? "Anonymous" : studentNameActual,
      trackingId,
      status: "Pending"
    });
    const savedComplaint = await complaint.save();
    res.status(201).json(savedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /complaints - Retrieve all complaints
app.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ submissionDate: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /complaints/pending - Retrieve pending complaints for teacher view
app.get("/complaints/pending", async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: { $in: ["Pending", "In Progress"] }
    }).sort({ submissionDate: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /complaints/:id - Update a complaint (e.g., when a teacher resolves it)
app.patch("/complaints/:id", async (req, res) => {
  try {
    const updates = req.body;
    const updatedComplaint = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedComplaint)
      return res.status(404).json({ error: "Complaint not found" });
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to MongoDB and start the server
mongoose
  .connect("mongodb://localhost:27017/complaintsDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));