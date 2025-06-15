import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const backendUrl = "http://localhost:8000";

const TransparentAcceptance = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${backendUrl}/applications`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError("Failed to fetch applications: " + err.message);
    }
  };

  // Update application status (and attach a teacher statement if provided)
  const updateApplication = async (id, status, statement = "") => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, teacherStatement: statement }),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchApplications();
    } catch (err) {
      setError("Failed to update application: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (id) => {
    const statement = prompt("Enter note (optional):");
    updateApplication(id, "Accepted", statement || "");
  };

  const handleReject = (id) => {
    const statement = prompt("Enter reason for rejection (optional):");
    updateApplication(id, "Rejected", statement || "");
  };

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-purple-500 to-pink-600 py-8 shadow-xl mb-10">
        <h1 className="text-5xl font-extrabold text-center">
          Faculty Application Approval Dashboard
        </h1>
      </header>
      <main className="px-6 md:px-12 max-w-5xl mx-auto">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">All Applications (Oldest First)</h2>
          {applications.length === 0 ? (
            <p className="text-center">No applications found.</p>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-gray-800 rounded-lg shadow-xl"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-semibold">{app.text}</h3>
                      <p className="text-sm text-gray-400">Type: {app.domain}</p>
                      <p className="text-sm text-gray-400">
                        Priority: {app.priority}{" "}
                        {app.priority === "High" && app.status === "Pending" && (
                          <span className="ml-2 px-2 py-1 bg-red-600 text-xs font-bold rounded">
                            Escalated
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-400">Tracking ID: {app.trackingId}</p>
                      {app.teacherStatement && (
                        <p className="text-sm text-green-300 mt-2">
                          Note: {app.teacherStatement}
                        </p>
                      )}
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                      <p className="text-sm text-gray-400">
                        {new Date(app.submissionDate).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium mt-1">Status: {app.status}</p>
                      {app.status === "Pending" && (
                        <div className="mt-4 flex space-x-3">
                          <button
                            onClick={() => handleAccept(app._id)}
                            disabled={loading}
                            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded shadow"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(app._id)}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded shadow"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default TransparentAcceptance;
