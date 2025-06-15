// MessBudgate.js
import React, { useEffect, useState } from "react";

const backendUrl = "http://localhost:9000";

const MessBudgate = () => {
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState("");

  // Fetch all budget records on mount
  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${backendUrl}/budgets`);
      if (!res.ok) throw new Error("Failed to fetch budgets");
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/budget/${id}/approve`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Approval failed");
      // Update local state
      setBudgets(budgets.map((b) => (b._id === id ? { ...b, approvalStatus: "Approved" } : b)));
    } catch (err) {
      alert("Error approving budget: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/budget/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Deletion failed");
      // Remove record from state
      setBudgets(budgets.filter((b) => b._id !== id));
    } catch (err) {
      alert("Error deleting budget: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">Teacher Dashboard: Budget Management</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <p>No budget records available.</p>
        ) : (
          budgets.map((budget) => (
            <div key={budget._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <p>
                  <strong>Date:</strong> {budget.date}
                </p>
                <p>
                  <strong>Total Budget:</strong> ₹{budget.totalBudget.toFixed(2)}
                </p>
                <p>
                  <strong>Approval Status:</strong> {budget.approvalStatus}
                </p>
                <p>
                  <strong>Breakdown:</strong> Basic ₹{budget.breakdown.basicCost.toFixed(2)}, Variable ₹
                  {budget.breakdown.variableCost.toFixed(2)}, Overhead ₹
                  {budget.breakdown.overhead.toFixed(2)}, Detailed ₹
                  {budget.breakdown.detailedExpenses.toFixed(2)}
                </p>
              </div>
              <div className="space-x-2">
                {budget.approvalStatus !== "Approved" && (
                  <button onClick={() => handleApprove(budget._id)} className="bg-green-500 text-white px-3 py-1 rounded">
                    Approve
                  </button>
                )}
                <button onClick={() => handleDelete(budget._id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessBudgate;
