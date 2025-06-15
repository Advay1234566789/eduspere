// ClubApproval.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const backendUrl = "http://localhost:5500";

const ClubApproval = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  // For simplicity, we assume the admin is already logged in.
  const adminUser = { id: "admin1", username: "admin", role: "admin" };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${backendUrl}/bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError("Failed to fetch bookings: " + err.message);
    }
  };

  const updateStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${backendUrl}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");
      fetchBookings();
    } catch (err) {
      setError("Failed to update status: " + err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 2000);
    return () => clearInterval(interval);
  }, []);

  // Separate bookings into pending and processed.
  const pendingBookings = bookings.filter(b => b.status === "Pending");
  const processedBookings = bookings.filter(b => b.status !== "Pending");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 py-6 shadow-lg mb-8">
        <h1 className="text-4xl font-bold text-center">
          Club Approval - Booking Management
        </h1>
      </header>
      <main className="px-4 md:px-8 max-w-5xl mx-auto">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {/* Pending Bookings Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Pending Bookings</h2>
          {pendingBookings.length === 0 ? (
            <p>No pending bookings found.</p>
          ) : (
            <div className="grid gap-6">
              {pendingBookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-gray-800 rounded-lg shadow-lg"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-semibold">
                        {booking.resource}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Date: {booking.date} | Time: {booking.time}
                      </p>
                      <p className="text-sm text-gray-400">
                        Duration: {booking.duration} mins
                      </p>
                      <p className="text-sm text-gray-400">
                        Submitted By: {booking.submittedBy}
                      </p>
                      {booking.details && (
                        <p className="text-sm text-gray-400">
                          Details: {booking.details}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {new Date(booking.submissionDate).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium">
                        Status: {booking.status}
                      </p>
                      <div className="mt-2">
                        <button
                          onClick={() => updateStatus(booking._id, "Approved")}
                          className="mr-2 bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(booking._id, "Rejected")}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Processed Bookings Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Processed Bookings</h2>
          {processedBookings.length === 0 ? (
            <p>No processed bookings found.</p>
          ) : (
            <div className="grid gap-6">
              {processedBookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-gray-800 rounded-lg shadow-lg"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-semibold">
                        {booking.resource}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Date: {booking.date} | Time: {booking.time}
                      </p>
                      <p className="text-sm text-gray-400">
                        Duration: {booking.duration} mins
                      </p>
                      <p className="text-sm text-gray-400">
                        Submitted By: {booking.submittedBy}
                      </p>
                      {booking.details && (
                        <p className="text-sm text-gray-400">
                          Details: {booking.details}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {new Date(booking.submissionDate).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium">
                        Status: {booking.status}
                      </p>
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

export default ClubApproval;
