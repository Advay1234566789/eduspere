// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 9000;

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/election", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB at mongodb://localhost:27017/election"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Define Budget Schema and Model
const budgetSchema = new mongoose.Schema({
  date: { type: String, required: true },
  totalBudget: { type: Number, required: true },
  breakdown: {
    basicCost: { type: Number, required: true },
    variableCost: { type: Number, required: true },
    overhead: { type: Number, required: true },
    detailedExpenses: { type: Number, required: true },
  },
  approvalStatus: { type: String, default: "Not Submitted" },
});

const Budget = mongoose.model("Budget", budgetSchema);

// POST /budget - Create a new budget record
app.post("/budget", async (req, res) => {
  try {
    const newBudget = new Budget(req.body);
    const savedBudget = await newBudget.save();
    res.status(201).json(savedBudget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /budgets - Get all budget records
app.get("/budgets", async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /budget/:id/approve - Approve a budget record
app.patch("/budget/:id/approve", async (req, res) => {
  try {
    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "Approved" },
      { new: true }
    );
    if (!updatedBudget) return res.status(404).json({ error: "Budget not found" });
    res.json(updatedBudget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /budget/:id - Delete a budget record
app.delete("/budget/:id", async (req, res) => {
  try {
    const deletedBudget = await Budget.findByIdAndDelete(req.params.id);
    if (!deletedBudget) return res.status(404).json({ error: "Budget not found" });
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
