// // index.js (Backend)
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// const port = 8000;

// // Connect to MongoDB
// mongoose.connect("mongodb://localhost:27017/election", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // Define the Application schema and model
// const applicationSchema = new mongoose.Schema({
//   text: { type: String, required: true },
//   domain: { type: String, required: true },
//   priority: { type: String, required: true },
//   studentId: { type: String, required: true },
//   isAnonymous: { type: Boolean, default: false },
//   submissionDate: { type: Date, default: Date.now },
//   status: { type: String, default: "Pending" }, // Other statuses: Accepted, Rejected
//   trackingId: {
//     type: String,
//     default: () => Math.random().toString(36).substr(2, 9),
//   },
//   teacherStatement: { type: String }
// });

// const Application = mongoose.model("Application", applicationSchema);

// // Endpoint to get all applications
// app.get("/applications", async (req, res) => {
//   try {
//     const applications = await Application.find();
//     res.json(applications);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Endpoint to create a new application
// app.post("/applications", async (req, res) => {
//   try {
//     const { text, domain, priority, studentId, isAnonymous } = req.body;
//     const application = new Application({ text, domain, priority, studentId, isAnonymous });
//     await application.save();
//     res.json(application);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Endpoint to update an application (for accept/reject)
// app.put("/applications/:id", async (req, res) => {
//   try {
//     const { status, teacherStatement } = req.body;
//     const application = await Application.findByIdAndUpdate(
//       req.params.id,
//       { status, teacherStatement },
//       { new: true }
//     );
//     if (!application) {
//       return res.status(404).json({ error: "Application not found" });
//     }
//     res.json(application);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 8000;

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/election", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middlewares
app.use(cors());
app.use(express.json());

// Define the Application schema and model
const applicationSchema = new mongoose.Schema({
  text: { type: String, required: true },
  domain: { type: String, required: true },
  priority: { type: String, required: true },
  studentId: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  submissionDate: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" }, // Other statuses: Accepted, Rejected
  trackingId: {
    type: String,
    default: () => Math.random().toString(36).substr(2, 9),
  },
  teacherStatement: { type: String },
});

const Application = mongoose.model("Application", applicationSchema);

// Endpoint to get all applications
app.get("/applications", async (req, res) => {
  try {
    // Escalate priority for pending applications older than threshold (60 seconds)
    const escalateThreshold = 60000; // 60 seconds in milliseconds
    const now = new Date();
    await Application.updateMany(
      {
        status: "Pending",
        priority: "Low",
        submissionDate: { $lte: new Date(now.getTime() - escalateThreshold) },
      },
      { $set: { priority: "High" } }
    );
    // Return applications sorted by submissionDate (oldest first)
    const applications = await Application.find().sort({ submissionDate: 1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to create a new application
app.post("/applications", async (req, res) => {
  try {
    const { text, domain, priority, studentId, isAnonymous } = req.body;
    const application = new Application({ text, domain, priority, studentId, isAnonymous });
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an application (for accept/reject)
app.put("/applications/:id", async (req, res) => {
  try {
    const { status, teacherStatement } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, teacherStatement },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
