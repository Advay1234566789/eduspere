import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Connect to the backend Socket.IO server (adjust the URL/port if needed)
const socket = io("http://localhost:8500");

const DoctorAdvice = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Fetch all leave requests when the component mounts
  useEffect(() => {
    fetch("http://localhost:8500/api/leaveRequests")
      .then((res) => res.json())
      .then((data) => setLeaveRequests(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // Listen for real-time updates from the backend
  useEffect(() => {
    socket.on("newLeaveRequest", (request) => {
      setLeaveRequests((prev) => [request, ...prev]);
    });
    socket.on("updateLeaveRequest", (updatedRequest) => {
      setLeaveRequests((prev) =>
        prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
      );
    });
    return () => {
      socket.off("newLeaveRequest");
      socket.off("updateLeaveRequest");
    };
  }, []);

  // Update the status (accept or reject) of a leave request
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8500/api/leaveRequests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const updatedRequest = await res.json();
      setLeaveRequests((prev) =>
        prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
      );
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Doctor Advice Dashboard</h2>
        {leaveRequests.length === 0 ? (
          <p className="text-gray-600">No leave requests found.</p>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row justify-between items-center"
              >
                <div>
                  <p className="text-lg font-semibold">{request.studentName}</p>
                  <p className="text-sm text-gray-600">
                    Sick Reason: {request.sickReason}
                  </p>
                  <p className="text-sm text-gray-600">
                    Additional Symptoms: {request.additionalSymptoms || "None"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Severity: {request.severity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {request.status}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 space-x-2">
                  {request.status === "pending" && (
                    <>
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => updateStatus(request._id, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => updateStatus(request._id, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAdvice;
