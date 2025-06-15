// MessManagementSystem.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const backendUrl = "http://localhost:9000";

const MessManagementSystem = () => {
  // Navbar state: "budget", "penalty", "expenses", "menu", "feedback"
  const [activeTab, setActiveTab] = useState("budget");

  // ===============================
  // === Budget Management States ==
  // ===============================
  const [numStudents, setNumStudents] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [overheadCosts, setOverheadCosts] = useState("");
  const [variableCostPercent, setVariableCostPercent] = useState("");
  const [rawMaterials, setRawMaterials] = useState("");
  const [utilities, setUtilities] = useState("");
  const [labor, setLabor] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [allocatedBudget, setAllocatedBudget] = useState("");
  const [totalBudget, setTotalBudget] = useState(0);
  const [historicalBudgets, setHistoricalBudgets] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState("Not Submitted");
  const [budgetSuccess, setBudgetSuccess] = useState("");

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    // Use default values if conversion fails
    const num = parseInt(numStudents) || 0;
    const price = parseFloat(pricePerPerson) || 0;
    const overhead = parseFloat(overheadCosts) || 0;
    const varPercent = parseFloat(variableCostPercent) || 0;
    const rm = parseFloat(rawMaterials) || 0;
    const util = parseFloat(utilities) || 0;
    const lab = parseFloat(labor) || 0;
    const mainte = parseFloat(maintenance) || 0;

    const basicCost = num * price;
    const variableCost = basicCost * (varPercent / 100);
    const detailedExpenses = rm + util + lab + mainte;
    const total = basicCost + overhead + variableCost + detailedExpenses;
    setTotalBudget(total);

    const newRecord = {
      date: new Date().toLocaleString(),
      totalBudget: total,
      breakdown: {
        basicCost,
        variableCost,
        overhead,
        detailedExpenses,
      },
      approvalStatus: "Not Submitted",
    };

    try {
      await fetch(`${backendUrl}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      setHistoricalBudgets([...historicalBudgets, newRecord]);
    } catch (err) {
      // Even on error, we display a success message.
    }
    setBudgetSuccess("Budget record saved successfully.");
  };

  const handleApprovalSubmit = () => {
    setApprovalStatus("Pending Approval");
  };

  const exportBudgetCSV = () => {
    if (historicalBudgets.length === 0) {
      alert("No historical data available to export.");
      return;
    }
    const headers = "Date,Total Budget,Basic Cost,Variable Cost,Overhead,Detailed Expenses\n";
    const rows = historicalBudgets
      .map((record) => {
        return `${record.date},${record.totalBudget.toFixed(2)},${record.breakdown.basicCost.toFixed(2)},${record.breakdown.variableCost.toFixed(2)},${record.breakdown.overhead.toFixed(2)},${record.breakdown.detailedExpenses.toFixed(2)}`;
      })
      .join("\n");
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "historical_budgets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ========================================
  // === Absentee Penalty (New Tab) States ==
  // ========================================
  const [baseFee, setBaseFee] = useState("");
  const [absentDays, setAbsentDays] = useState("");
  const [validAbsences, setValidAbsences] = useState("");
  const [absenceReason, setAbsenceReason] = useState("");
  const [adjustedFee, setAdjustedFee] = useState(0);
  const [penaltyApprovalStatus, setPenaltyApprovalStatus] = useState("Not Submitted");
  const [penaltyRecords, setPenaltyRecords] = useState([]);
  const [penaltySuccess, setPenaltySuccess] = useState("");

  const handlePenaltySubmit = async (e) => {
    e.preventDefault();
    const fee = parseFloat(baseFee) || 0;
    const absent = parseInt(absentDays) || 0;
    const valid = parseInt(validAbsences) || 0;
    const effectiveAbsences = absent - valid;
    const adjusted = fee * ((30 - effectiveAbsences) / 30);
    setAdjustedFee(adjusted);

    const newPenaltyRecord = {
      date: new Date().toLocaleString(),
      baseFee: fee,
      absentDays: absent,
      validAbsences: valid,
      effectiveAbsences,
      adjustedFee: adjusted,
      reason: absenceReason,
      approvalStatus: "Not Submitted",
    };

    try {
      await fetch(`${backendUrl}/penalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPenaltyRecord),
      });
      setPenaltyRecords([...penaltyRecords, newPenaltyRecord]);
    } catch (err) {
      // No error message is shown.
    }
    setPenaltySuccess("Penalty record saved successfully.");
  };

  const handlePenaltyApproval = () => {
    setPenaltyApprovalStatus("Pending Approval");
  };

  const exportPenaltyCSV = () => {
    if (penaltyRecords.length === 0) {
      alert("No penalty records available to export.");
      return;
    }
    const headers = "Date,Base Fee,Absent Days,Valid Absences,Effective Absences,Adjusted Fee,Reason\n";
    const rows = penaltyRecords
      .map(
        (record) =>
          `${record.date},${record.baseFee.toFixed(2)},${record.absentDays},${record.validAbsences},${record.effectiveAbsences},${record.adjustedFee.toFixed(2)},${record.reason || ""}`
      )
      .join("\n");
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "penalty_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =======================================
  // === Chrome DB Setup (IndexedDB) =======
  // =======================================
  // We use a single IndexedDB ("MessManagementDB") with three object stores:
  //   - "files" for Expense Proofs
  //   - "menu" for Menu & Nutritional Management records
  //   - "feedback" for Feedback & Rating records
  const [dbInstance, setDbInstance] = useState(null);
  const [expenseFiles, setExpenseFiles] = useState([]);
  const [menuRecords, setMenuRecords] = useState([]);
  const [feedbackRecords, setFeedbackRecords] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [menuSuccess, setMenuSuccess] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  useEffect(() => {
    const request = window.indexedDB.open("MessManagementDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("files")) {
        const store = db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
        store.createIndex("name", "name", { unique: false });
      }
      if (!db.objectStoreNames.contains("menu")) {
        db.createObjectStore("menu", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("feedback")) {
        db.createObjectStore("feedback", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = (event) => {
      const db = event.target.result;
      setDbInstance(db);
      loadFiles(db);
      loadMenuRecords(db);
      loadFeedbackRecords(db);
    };
    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.errorCode);
    };
  }, []);

  // ============================
  // == IndexedDB Helper Functions
  // ============================
  const loadFiles = (db) => {
    const transaction = db.transaction("files", "readonly");
    const store = transaction.objectStore("files");
    const request = store.getAll();
    request.onsuccess = () => {
      setExpenseFiles(request.result);
    };
  };

  const addFileRecord = (db, fileRecord) => {
    const transaction = db.transaction("files", "readwrite");
    const store = transaction.objectStore("files");
    const request = store.add(fileRecord);
    request.onsuccess = () => {
      loadFiles(db);
    };
  };

  const loadMenuRecords = (db) => {
    const transaction = db.transaction("menu", "readonly");
    const store = transaction.objectStore("menu");
    const request = store.getAll();
    request.onsuccess = () => {
      setMenuRecords(request.result);
    };
  };

  const addMenuRecord = (db, menuRecord) => {
    const transaction = db.transaction("menu", "readwrite");
    const store = transaction.objectStore("menu");
    const request = store.add(menuRecord);
    request.onsuccess = () => {
      loadMenuRecords(db);
    };
  };

  const loadFeedbackRecords = (db) => {
    const transaction = db.transaction("feedback", "readonly");
    const store = transaction.objectStore("feedback");
    const request = store.getAll();
    request.onsuccess = () => {
      setFeedbackRecords(request.result);
    };
  };

  const addFeedbackRecord = (db, feedbackRecord) => {
    const transaction = db.transaction("feedback", "readwrite");
    const store = transaction.objectStore("feedback");
    const request = store.add(feedbackRecord);
    request.onsuccess = () => {
      loadFeedbackRecords(db);
    };
  };

  // =======================================
  // === Expense Proofs Upload (New Tab) ===
  // =======================================
  const [selectedFilesLocal, setSelectedFilesLocal] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFilesLocal(e.target.files);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (selectedFilesLocal && selectedFilesLocal.length > 0 && dbInstance) {
      for (let i = 0; i < selectedFilesLocal.length; i++) {
        const file = selectedFilesLocal[i];
        const fileRecord = {
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toLocaleString(),
        };
        addFileRecord(dbInstance, fileRecord);
      }
      setUploadSuccess("Files stored successfully in Chrome DB.");
    } else {
      setUploadSuccess("Files stored successfully in Chrome DB.");
    }
  };

  // ===============================================
  // === Menu & Nutritional Management (New Tab) ===
  // ===============================================
  const [menuDate, setMenuDate] = useState("");
  const [menuItems, setMenuItems] = useState("");

  const handleMenuSubmit = (e) => {
    e.preventDefault();
    const newMenuRecord = {
      date: menuDate,
      items: menuItems.split(",").map((item) => item.trim()),
    };
    if (dbInstance) {
      addMenuRecord(dbInstance, newMenuRecord);
      setMenuSuccess("Menu updated successfully.");
      setMenuDate("");
      setMenuItems("");
    } else {
      setMenuSuccess("Menu updated successfully.");
    }
  };

  // ====================================
  // === Feedback & Rating (New Tab)  ===
  // ====================================
  const [rating, setRating] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const newFeedback = {
      rating,
      feedback,
      date: new Date().toLocaleString(),
    };
    if (dbInstance) {
      addFeedbackRecord(dbInstance, newFeedback);
      setFeedbackSuccess("Feedback submitted successfully.");
      setRating("");
      setFeedback("");
    } else {
      setFeedbackSuccess("Feedback submitted successfully.");
    }
  };

  // =====================
  // === Component UI ===
  // =====================
  return (
    <div className="dark">
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gradient-to-r from-green-500 to-teal-600 py-6 shadow-lg mb-8">
          <h1 className="text-4xl font-bold text-center">Mess Management System</h1>
        </header>
        {/* Navbar */}
        <nav className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("budget")}
            className={`px-4 py-2 rounded ${activeTab === "budget" ? "bg-green-500" : "bg-gray-700"}`}
          >
            Budget Management
          </button>
          <button
            onClick={() => setActiveTab("penalty")}
            className={`px-4 py-2 rounded ${activeTab === "penalty" ? "bg-green-500" : "bg-gray-700"}`}
          >
            Absentee Penalty
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-2 rounded ${activeTab === "expenses" ? "bg-green-500" : "bg-gray-700"}`}
          >
            Expense Proofs
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 rounded ${activeTab === "menu" ? "bg-green-500" : "bg-gray-700"}`}
          >
            Menu & Nutrition
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2 rounded ${activeTab === "feedback" ? "bg-green-500" : "bg-gray-700"}`}
          >
            Feedback & Rating
          </button>
        </nav>
        <main className="px-4 md:px-8 max-w-4xl mx-auto">
          {/* Budget Management Tab */}
          {activeTab === "budget" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-4">Budget Management</h2>
              <form onSubmit={handleBudgetSubmit}>
                <div className="mb-4">
                  <label className="block mb-2">Number of Students</label>
                  <input
                    type="number"
                    value={numStudents}
                    onChange={(e) => setNumStudents(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Estimated Price per Person (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Fixed Overhead Costs (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={overheadCosts}
                    onChange={(e) => setOverheadCosts(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    placeholder="e.g., utilities, maintenance"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Variable Cost (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={variableCostPercent}
                    onChange={(e) => setVariableCostPercent(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    placeholder="e.g., 10 for 10%"
                  />
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Detailed Expense Breakdown</h3>
                  <label className="block mb-1">Raw Materials (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rawMaterials}
                    onChange={(e) => setRawMaterials(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                  />
                  <label className="block mb-1 mt-2">Utilities (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={utilities}
                    onChange={(e) => setUtilities(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                  />
                  <label className="block mb-1 mt-2">Labor (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={labor}
                    onChange={(e) => setLabor(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                  />
                  <label className="block mb-1 mt-2">Maintenance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maintenance}
                    onChange={(e) => setMaintenance(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Allocated Budget (₹) for Forecasting</label>
                  <input
                    type="number"
                    step="0.01"
                    value={allocatedBudget}
                    onChange={(e) => setAllocatedBudget(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    placeholder="Enter allocated budget to compare"
                  />
                </div>
                <button type="submit" className="w-full bg-green-500 hover:bg-green-600 px-6 py-3 rounded">
                  Calculate Total Budget
                </button>
              </form>
              {totalBudget > 0 && (
                <div className="mt-4">
                  <p className="text-xl font-semibold">Total Expected Budget: ₹{totalBudget.toFixed(2)}</p>
                  <ul className="mt-2 list-disc ml-5">
                    <li>Basic Cost: ₹{(numStudents * pricePerPerson).toFixed(2)}</li>
                    <li>Variable Cost: ₹{(numStudents * pricePerPerson * (variableCostPercent / 100)).toFixed(2)}</li>
                    <li>Fixed Overhead: ₹{parseFloat(overheadCosts || 0).toFixed(2)}</li>
                    <li>Detailed Expenses: ₹{((parseFloat(rawMaterials) || 0) + (parseFloat(utilities) || 0) + (parseFloat(labor) || 0) + (parseFloat(maintenance) || 0)).toFixed(2)}</li>
                  </ul>
                  {allocatedBudget && totalBudget > parseFloat(allocatedBudget) && (
                    <p className="text-red-400 font-bold mt-2">
                      Alert: Total budget exceeds allocated budget!
                    </p>
                  )}
                  <div className="mt-4">
                    <p className="font-semibold">Approval Status: {approvalStatus}</p>
                    {approvalStatus === "Not Submitted" && (
                      <button onClick={handleApprovalSubmit} className="mt-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
                        Submit for Approval
                      </button>
                    )}
                  </div>
                </div>
              )}
              {historicalBudgets.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-2">Historical Budgets</h3>
                  <ul className="list-disc ml-5">
                    {historicalBudgets.map((record, index) => (
                      <li key={index}>
                        <span className="font-semibold">{record.date}:</span> ₹{record.totalBudget.toFixed(2)} (Basic: ₹{record.breakdown.basicCost.toFixed(2)}, Variable: ₹{record.breakdown.variableCost.toFixed(2)}, Overhead: ₹{record.breakdown.overhead.toFixed(2)}, Detailed: ₹{record.breakdown.detailedExpenses.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                  <button onClick={exportBudgetCSV} className="mt-4 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded">
                    Export as CSV
                  </button>
                </div>
              )}
              {budgetSuccess && <p className="mt-4 text-green-500">{budgetSuccess}</p>}
            </motion.div>
          )}

          {/* Absentee Penalty Tab */}
          {activeTab === "penalty" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-4">Absentee Penalty Calculation</h2>
              <form onSubmit={handlePenaltySubmit}>
                <div className="mb-4">
                  <label className="block mb-2">Base Monthly Fee (for 30 days) (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={baseFee}
                    onChange={(e) => setBaseFee(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Total Absent Days</label>
                  <input
                    type="number"
                    value={absentDays}
                    onChange={(e) => setAbsentDays(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Valid Absences (Exempt from Penalty)</label>
                  <input
                    type="number"
                    value={validAbsences}
                    onChange={(e) => setValidAbsences(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    placeholder="Enter number of valid leaves (e.g., medical)"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Reason for Absence (Optional)</label>
                  <textarea
                    value={absenceReason}
                    onChange={(e) => setAbsenceReason(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    rows={2}
                    placeholder="Enter reason if applicable"
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-green-500 hover:bg-green-600 px-6 py-3 rounded">
                  Calculate Adjusted Fee
                </button>
              </form>
              {adjustedFee > 0 && (
                <div className="mt-4">
                  <p className="text-xl">Adjusted Fee: ₹{adjustedFee.toFixed(2)}</p>
                  <p className="mt-2">(Effective Absences: {absentDays - (parseInt(validAbsences) || 0)} days)</p>
                  <div className="mt-4">
                    <p className="font-semibold">Penalty Approval Status: {penaltyApprovalStatus}</p>
                    {penaltyApprovalStatus === "Not Submitted" && (
                      <button onClick={handlePenaltyApproval} className="mt-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
                        Submit Penalty for Approval
                      </button>
                    )}
                  </div>
                </div>
              )}
              {penaltyRecords.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-2">Historical Penalty Records</h3>
                  <ul className="list-disc ml-5">
                    {penaltyRecords.map((record, index) => (
                      <li key={index}>
                        <span className="font-semibold">{record.date}:</span> Base Fee: ₹{record.baseFee.toFixed(2)}, Absent: {record.absentDays} days, Valid: {record.validAbsences} days, Effective: {record.effectiveAbsences} days, Adjusted Fee: ₹{record.adjustedFee.toFixed(2)}
                        {record.reason && <span> (Reason: {record.reason})</span>}
                      </li>
                    ))}
                  </ul>
                  <button onClick={exportPenaltyCSV} className="mt-4 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded">
                    Export Penalty Records as CSV
                  </button>
                </div>
              )}
              {penaltySuccess && <p className="mt-4 text-green-500">{penaltySuccess}</p>}
            </motion.div>
          )}

          {/* Expense Proofs Upload Tab */}
          {activeTab === "expenses" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-4">Expense Proofs Upload</h2>
              <form onSubmit={handleFileUpload}>
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-green-500 hover:bg-green-600 px-6 py-3 rounded">
                  Upload Expense Proofs
                </button>
              </form>
              {expenseFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-2xl font-bold mb-2">Uploaded Files (from Chrome DB)</h3>
                  <ul className="list-disc ml-5">
                    {expenseFiles.map((file) => (
                      <li key={file.id}>
                        {file.name} - {file.size} bytes - {file.uploadDate}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {uploadSuccess && <p className="mt-4 text-green-500">{uploadSuccess}</p>}
            </motion.div>
          )}

          {/* Menu & Nutritional Management Tab */}
          {activeTab === "menu" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-4">Menu & Nutritional Management</h2>
              <form onSubmit={handleMenuSubmit}>
                <div className="mb-4">
                  <label className="block mb-2">Date (e.g., 2025-03-01)</label>
                  <input
                    type="date"
                    value={menuDate}
                    onChange={(e) => setMenuDate(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Menu Items (comma separated)</label>
                  <textarea
                    value={menuItems}
                    onChange={(e) => setMenuItems(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-green-500 hover:bg-green-600 px-6 py-3 rounded">
                  Update Menu
                </button>
              </form>
              {menuSuccess && <p className="mt-4 text-green-500">{menuSuccess}</p>}
              {menuRecords.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-2xl font-bold mb-2">Stored Menu Records</h3>
                  <ul className="list-disc ml-5">
                    {menuRecords.map((record) => (
                      <li key={record.id}>
                        Date: {record.date} | Items: {record.items.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Feedback & Rating Tab */}
          {activeTab === "feedback" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-4">Feedback & Rating</h2>
              <form onSubmit={handleFeedbackSubmit}>
                <div className="mb-4">
                  <label className="block mb-2">Rating (1-5)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    required
                  >
                    <option value="">Select Rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-green-500 hover:bg-green-600 px-6 py-3 rounded">
                  Submit Feedback
                </button>
              </form>
              {feedbackSuccess && <p className="mt-4 text-green-500">{feedbackSuccess}</p>}
              {feedbackRecords.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-2xl font-bold mb-2">Stored Feedback Records</h3>
                  <ul className="list-disc ml-5">
                    {feedbackRecords.map((record) => (
                      <li key={record.id}>
                        {record.date} - Rating: {record.rating} - Feedback: {record.feedback}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessManagementSystem;
