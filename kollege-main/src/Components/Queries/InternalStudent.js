
// TransparentPulse.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const backendUrl = "http://localhost:4500";

// Dummy sentiment analysis function.
const calculateSentimentScore = (text) => Math.min(100, text.length);

const TransparentPulse = () => {
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [priority, setPriority] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [studentName, setStudentName] = useState("");

  // Simulate student login.
  const loginAsStudent = () => {
    if (!studentName.trim()) {
      setError("Please enter your name to log in as a student.");
      return;
    }
    setUser({ id: "s1", username: studentName, role: "student" });
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${backendUrl}/complaints`);
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      setError("Failed to fetch complaints: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = user ? user.username : studentName;
    if (!newComplaint.trim() || !selectedDomain || !priority || !finalName.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${backendUrl}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newComplaint,
          domain: selectedDomain,
          priority,
          studentNameActual: finalName,
          isAnonymous
        })
      });
      if (!res.ok) throw new Error("Submission failed");
      await fetchComplaints();
      setNewComplaint("");
      setSelectedDomain("");
      setPriority("");
      setIsAnonymous(false);
      if (!user) setStudentName("");
    } catch (err) {
      setError("Failed to submit complaint: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeComplaints = complaints.filter(
    complaint => complaint.status !== "Resolved"
  );
  const solvedComplaints = complaints.filter(
    complaint => complaint.status === "Resolved"
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 py-6 shadow-lg mb-8">
        <h1 className="text-4xl font-bold text-center">
          Transparent Pulse Complaint System
        </h1>
      </header>
      <main className="px-4 md:px-8 max-w-5xl mx-auto">
        {/* Login Section */}
        {!user && (
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 w-full max-w-md">
              <input
                type="text"
                placeholder="Your Name"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full p-4 rounded bg-gray-700 text-white"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={loginAsStudent}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded transition duration-200"
              >
                Login as Student
              </button>
            </div>
          </div>
        )}

        {/* Complaint Submission Form */}
        {(!user || user.role === "student") && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <form onSubmit={handleSubmit}>
              {/* If not logged in, show name input */}
              {!user && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white"
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <select
                  className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value)}
                  required
                >
                  <option value="">Select Domain</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Student Affairs">Student Affairs</option>
                </select>
                <select
                  className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <textarea
                  className="w-full p-4 rounded bg-gray-700 text-white"
                  placeholder="Describe your complaint..."
                  value={newComplaint}
                  onChange={e => setNewComplaint(e.target.value)}
                  rows={4}
                  required
                ></textarea>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymous" className="ml-2">
                  Submit Anonymously
                </label>
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded"
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>
        )}

        {/* Complaints List Section */}
        {user && (
          <>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Active Complaints</h2>
              {activeComplaints.length === 0 ? (
                <p>No active complaints found.</p>
              ) : (
                <div className="grid gap-6">
                  {activeComplaints.map(complaint => (
                    <motion.div
                      key={complaint._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 bg-gray-800 rounded-lg shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-semibold">
                            {complaint.text}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Domain: {complaint.domain}
                          </p>
                          <p className="text-sm text-gray-400">
                            Priority: {complaint.priority}
                          </p>
                          <p className="text-sm text-gray-400">
                            Tracking ID: {complaint.trackingId}
                          </p>
                          {/* For student view, always show "Anonymous" */}
                          <p className="text-sm text-gray-400">
                            Student: {complaint.studentNamePublic || "Anonymous"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            {new Date(complaint.submissionDate).toLocaleString()}
                          </p>
                          <p className="text-sm font-medium">
                            Status: {complaint.status}
                          </p>
                        </div>
                      </div>
                      {complaint.teacherStatement && (
                        <div className="mt-2 p-2 bg-green-700 rounded">
                          <p className="text-sm">
                            Teacher Statement: {complaint.teacherStatement}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Solved Complaints</h2>
              {solvedComplaints.length === 0 ? (
                <p>No solved complaints found.</p>
              ) : (
                <div className="grid gap-6">
                  {solvedComplaints.map(complaint => (
                    <motion.div
                      key={complaint._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 bg-gray-800 rounded-lg shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-semibold">
                            {complaint.text}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Domain: {complaint.domain}
                          </p>
                          <p className="text-sm text-gray-400">
                            Priority: {complaint.priority}
                          </p>
                          <p className="text-sm text-gray-400">
                            Tracking ID: {complaint.trackingId}
                          </p>
                          {/* In solved complaints, teacher name is shown if available */}
                          {complaint.teacherName && (
                            <p className="text-sm text-gray-400">
                              Solved by: {complaint.teacherName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            {new Date(complaint.submissionDate).toLocaleString()}
                          </p>
                          <p className="text-sm font-medium">
                            Status: {complaint.status}
                          </p>
                        </div>
                      </div>
                      {complaint.teacherStatement && (
                        <div className="mt-2 p-2 bg-green-700 rounded">
                          <p className="text-sm">
                            Teacher Statement: {complaint.teacherStatement}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default TransparentPulse;