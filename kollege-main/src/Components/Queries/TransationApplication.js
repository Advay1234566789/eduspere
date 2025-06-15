// // TransparentApplication.js
// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";

// const backendUrl = "http://localhost:8000";

// const TransparentApplication = () => {
//   const [applications, setApplications] = useState([]);
//   const [newApplication, setNewApplication] = useState("");
//   const [selectedDomain, setSelectedDomain] = useState("");
//   const [priority, setPriority] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState(null);
//   const [isAnonymous, setIsAnonymous] = useState(false);

//   // Simulated login for a student
//   const login = () => {
//     setUser({ id: "1", username: "student1", role: "student" });
//   };

//   const fetchApplications = async () => {
//     try {
//       const res = await fetch(`${backendUrl}/applications`);
//       const data = await res.json();
//       setApplications(data);
//     } catch (err) {
//       setError("Failed to fetch applications: " + err.message);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!newApplication.trim() || !selectedDomain || !priority) {
//       setError("Please fill all required fields.");
//       return;
//     }
//     if (!user) {
//       setError("Please log in first.");
//       return;
//     }
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch(`${backendUrl}/applications`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           text: newApplication,
//           domain: selectedDomain,
//           priority,
//           studentId: user.id,
//           isAnonymous
//         })
//       });
//       if (!res.ok) throw new Error("Submission failed");
//       await fetchApplications();
//       // Clear form fields after submission
//       setNewApplication("");
//       setSelectedDomain("");
//       setPriority("");
//       setIsAnonymous(false);
//     } catch (err) {
//       setError("Failed to submit application: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApplications();
//     const interval = setInterval(fetchApplications, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   // Separate applications by status:
//   // Active if still "Pending"; otherwise processed.
//   const activeApplications = applications.filter(app => app.status === "Pending");
//   const processedApplications = applications.filter(app => app.status !== "Pending");

//   return (
//     <div className="dark">
//       <div className="min-h-screen bg-gray-900 text-white">
//         <header className="bg-gradient-to-r from-blue-500 to-indigo-600 py-6 shadow-lg mb-8">
//           <h1 className="text-4xl font-bold text-center">
//             Transparent Application Submission
//           </h1>
//         </header>
//         <main className="px-4 md:px-8 max-w-5xl mx-auto">
//           {/* Login Section */}
//           {!user && (
//             <div className="mb-8 flex justify-center">
//               <button
//                 onClick={login}
//                 className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded transition duration-200"
//               >
//                 Login as Student
//               </button>
//             </div>
//           )}
//           {/* Application Submission Form */}
//           {user && (
//             <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
//               <form onSubmit={handleSubmit}>
//                 <div className="mb-4">
//                   <select
//                     className="w-full p-4 rounded bg-gray-700 text-white mb-4"
//                     value={selectedDomain}
//                     onChange={(e) => setSelectedDomain(e.target.value)}
//                     required
//                   >
//                     <option value="">Select Application Type</option>
//                     <option value="Event Organization">Event Organization</option>
//                     <option value="Budget Approvals">Budget Approvals</option>
//                     <option value="Sponsorships">Sponsorships</option>
//                   </select>
//                   <select
//                     className="w-full p-4 rounded bg-gray-700 text-white mb-4"
//                     value={priority}
//                     onChange={(e) => setPriority(e.target.value)}
//                     required
//                   >
//                     <option value="">Select Priority</option>
//                     <option value="High">High Priority</option>
//                     <option value="Low">Low Priority</option>
//                   </select>
//                   <textarea
//                     className="w-full p-4 rounded bg-gray-700 text-white"
//                     placeholder="Describe your application..."
//                     value={newApplication}
//                     onChange={(e) => setNewApplication(e.target.value)}
//                     rows={4}
//                     required
//                   ></textarea>
//                 </div>
//                 <div className="flex items-center mb-4">
//                   <input
//                     type="checkbox"
//                     id="anonymous"
//                     checked={isAnonymous}
//                     onChange={(e) => setIsAnonymous(e.target.checked)}
//                   />
//                   <label htmlFor="anonymous" className="ml-2">
//                     Submit Anonymously
//                   </label>
//                 </div>
//                 {error && <p className="text-red-500 mb-4">{error}</p>}
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded"
//                 >
//                   {loading ? "Submitting..." : "Submit Application"}
//                 </button>
//               </form>
//             </div>
//           )}

//           {/* Display Active Applications */}
//           {user && (
//             <>
//               <section className="mb-12">
//                 <h2 className="text-3xl font-bold mb-4">Active Applications</h2>
//                 {activeApplications.length === 0 ? (
//                   <p>No active applications found.</p>
//                 ) : (
//                   <div className="grid gap-6">
//                     {activeApplications.map((app) => (
//                       <motion.div
//                         key={app._id}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         whileHover={{ scale: 1.02 }}
//                         className="p-6 bg-gray-800 rounded-lg shadow-lg"
//                       >
//                         <div className="flex flex-col md:flex-row justify-between items-start">
//                           <div>
//                             <h3 className="text-2xl font-semibold">{app.text}</h3>
//                             <p className="text-sm text-gray-400">
//                               Type: {app.domain}
//                             </p>
//                             <p className="text-sm text-gray-400">
//                               Priority: {app.priority}
//                             </p>
//                             <p className="text-sm text-gray-400">
//                               Tracking ID: {app.trackingId}
//                             </p>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-sm text-gray-400">
//                               {new Date(app.submissionDate).toLocaleString()}
//                             </p>
//                             <p className="text-sm font-medium">Status: {app.status}</p>
//                           </div>
//                         </div>
//                         {app.teacherStatement && (
//                           <div className="mt-2 p-2 bg-green-700 rounded">
//                             <p className="text-sm">
//                               Authority Note: {app.teacherStatement}
//                             </p>
//                           </div>
//                         )}
//                       </motion.div>
//                     ))}
//                   </div>
//                 )}
//               </section>

//               {/* Display Processed Applications */}
//               <section className="mb-12">
//                 <h2 className="text-3xl font-bold mb-4">Processed Applications</h2>
//                 {processedApplications.length === 0 ? (
//                   <p>No processed applications found.</p>
//                 ) : (
//                   <div className="grid gap-6">
//                     {processedApplications.map((app) => (
//                       <motion.div
//                         key={app._id}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         whileHover={{ scale: 1.02 }}
//                         className="p-6 bg-gray-800 rounded-lg shadow-lg"
//                       >
//                         <div className="flex flex-col md:flex-row justify-between items-start">
//                           <div>
//                             <h3 className="text-2xl font-semibold">{app.text}</h3>
//                             <p className="text-sm text-gray-400">
//                               Type: {app.domain}
//                             </p>
//                             <p className="text-sm text-gray-400">
//                               Priority: {app.priority}
//                             </p>
//                             <p className="text-sm text-gray-400">
//                               Tracking ID: {app.trackingId}
//                             </p>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-sm text-gray-400">
//                               {new Date(app.submissionDate).toLocaleString()}
//                             </p>
//                             <p className="text-sm font-medium">Status: {app.status}</p>
//                           </div>
//                         </div>
//                         {app.teacherStatement && (
//                           <div className="mt-2 p-2 bg-green-700 rounded">
//                             <p className="text-sm">
//                               Authority Note: {app.teacherStatement}
//                             </p>
//                           </div>
//                         )}
//                       </motion.div>
//                     ))}
//                   </div>
//                 )}
//               </section>
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default TransparentApplication;


// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";

// const backendUrl = "http://localhost:8000";

// const TransparentApplication = () => {
//   const [applications, setApplications] = useState([]);
//   const [newApplication, setNewApplication] = useState("");
//   const [selectedDomain, setSelectedDomain] = useState("");
//   const [priority, setPriority] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState(null);
//   const [isAnonymous, setIsAnonymous] = useState(false);

//   // Simulated login for a student
//   const login = () => {
//     setUser({ id: "1", username: "student1", role: "student" });
//   };

//   const fetchApplications = async () => {
//     try {
//       const res = await fetch(`${backendUrl}/applications`);
//       const data = await res.json();
//       setApplications(data);
//     } catch (err) {
//       setError("Failed to fetch applications: " + err.message);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!newApplication.trim() || !selectedDomain || !priority) {
//       setError("Please fill all required fields.");
//       return;
//     }
//     if (!user) {
//       setError("Please log in first.");
//       return;
//     }
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch(`${backendUrl}/applications`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           text: newApplication,
//           domain: selectedDomain,
//           priority,
//           studentId: user.id,
//           isAnonymous,
//         }),
//       });
//       if (!res.ok) throw new Error("Submission failed");
//       await fetchApplications();
//       // Clear form fields after submission
//       setNewApplication("");
//       setSelectedDomain("");
//       setPriority("");
//       setIsAnonymous(false);
//     } catch (err) {
//       setError("Failed to submit application: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApplications();
//     const interval = setInterval(fetchApplications, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   // Separate applications by status: Active if still "Pending"; otherwise processed.
//   const activeApplications = applications.filter((app) => app.status === "Pending");
//   const processedApplications = applications.filter((app) => app.status !== "Pending");

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       <header className="bg-gradient-to-r from-blue-500 to-indigo-600 py-8 shadow-xl mb-10">
//         <h1 className="text-5xl font-extrabold text-center">
//           Student Application Submission Portal
//         </h1>
//       </header>
//       <main className="px-6 md:px-12 max-w-5xl mx-auto">
//         {/* Login Section */}
//         {!user && (
//           <div className="mb-8 flex justify-center">
//             <button
//               onClick={login}
//               className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded transition duration-200 shadow"
//             >
//               Login as Student
//             </button>
//           </div>
//         )}
//         {/* Application Submission Form */}
//         {user && (
//           <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-10">
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <select
//                   className="w-full p-4 rounded bg-gray-700 text-white mb-4"
//                   value={selectedDomain}
//                   onChange={(e) => setSelectedDomain(e.target.value)}
//                   required
//                 >
//                   <option value="">Select Application Type</option>
//                   <option value="Event Organization">Event Organization</option>
//                   <option value="Budget Approvals">Budget Approvals</option>
//                   <option value="Sponsorships">Sponsorships</option>
//                 </select>
//                 <select
//                   className="w-full p-4 rounded bg-gray-700 text-white mb-4"
//                   value={priority}
//                   onChange={(e) => setPriority(e.target.value)}
//                   required
//                 >
//                   <option value="">Select Priority</option>
//                   <option value="High">High Priority</option>
//                   <option value="Low">Low Priority</option>
//                 </select>
//                 <textarea
//                   className="w-full p-4 rounded bg-gray-700 text-white"
//                   placeholder="Describe your application..."
//                   value={newApplication}
//                   onChange={(e) => setNewApplication(e.target.value)}
//                   rows={4}
//                   required
//                 ></textarea>
//               </div>
//               <div className="flex items-center mb-4">
//                 <input
//                   type="checkbox"
//                   id="anonymous"
//                   checked={isAnonymous}
//                   onChange={(e) => setIsAnonymous(e.target.checked)}
//                 />
//                 <label htmlFor="anonymous" className="ml-2">
//                   Submit Anonymously
//                 </label>
//               </div>
//               {error && <p className="text-red-500 mb-4">{error}</p>}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded shadow"
//               >
//                 {loading ? "Submitting..." : "Submit Application"}
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Display Active Applications */}
//         {user && (
//           <>
//             <section className="mb-12">
//               <h2 className="text-3xl font-bold mb-6">Active Applications</h2>
//               {activeApplications.length === 0 ? (
//                 <p className="text-center">No active applications found.</p>
//               ) : (
//                 <div className="grid gap-6">
//                   {activeApplications.map((app) => (
//                     <motion.div
//                       key={app._id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       whileHover={{ scale: 1.02 }}
//                       className="p-6 bg-gray-800 rounded-lg shadow-xl"
//                     >
//                       <div className="flex flex-col md:flex-row justify-between items-start">
//                         <div>
//                           <h3 className="text-2xl font-semibold">{app.text}</h3>
//                           <p className="text-sm text-gray-400">Type: {app.domain}</p>
//                           <p className="text-sm text-gray-400">
//                             Priority: {app.priority}{" "}
//                             {app.priority === "High" && app.status === "Pending" && (
//                               <span className="ml-2 px-2 py-1 bg-red-600 text-xs font-bold rounded">
//                                 Escalated
//                               </span>
//                             )}
//                           </p>
//                           <p className="text-sm text-gray-400">Tracking ID: {app.trackingId}</p>
//                         </div>
//                         <div className="text-right mt-4 md:mt-0">
//                           <p className="text-sm text-gray-400">
//                             {new Date(app.submissionDate).toLocaleString()}
//                           </p>
//                           <p className="text-sm font-medium mt-1">Status: {app.status}</p>
//                         </div>
//                       </div>
//                       {app.teacherStatement && (
//                         <div className="mt-2 p-2 bg-green-700 rounded">
//                           <p className="text-sm">Authority Note: {app.teacherStatement}</p>
//                         </div>
//                       )}
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </section>

//             {/* Display Processed Applications */}
//             <section className="mb-12">
//               <h2 className="text-3xl font-bold mb-6">Processed Applications</h2>
//               {processedApplications.length === 0 ? (
//                 <p className="text-center">No processed applications found.</p>
//               ) : (
//                 <div className="grid gap-6">
//                   {processedApplications.map((app) => (
//                     <motion.div
//                       key={app._id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       whileHover={{ scale: 1.02 }}
//                       className="p-6 bg-gray-800 rounded-lg shadow-xl"
//                     >
//                       <div className="flex flex-col md:flex-row justify-between items-start">
//                         <div>
//                           <h3 className="text-2xl font-semibold">{app.text}</h3>
//                           <p className="text-sm text-gray-400">Type: {app.domain}</p>
//                           <p className="text-sm text-gray-400">Priority: {app.priority}</p>
//                           <p className="text-sm text-gray-400">Tracking ID: {app.trackingId}</p>
//                         </div>
//                         <div className="text-right mt-4 md:mt-0">
//                           <p className="text-sm text-gray-400">
//                             {new Date(app.submissionDate).toLocaleString()}
//                           </p>
//                           <p className="text-sm font-medium mt-1">Status: {app.status}</p>
//                         </div>
//                       </div>
//                       {app.teacherStatement && (
//                         <div className="mt-2 p-2 bg-green-700 rounded">
//                           <p className="text-sm">Authority Note: {app.teacherStatement}</p>
//                         </div>
//                       )}
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </section>
//           </>
//         )}
//       </main>
//     </div>
//   );
// };

// export default TransparentApplication;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const backendUrl = "http://localhost:8000";

// New Navbar for selecting application types remains unchanged
const ApplicationNavbar = ({ selectedDomain, setSelectedDomain }) => {
  return (
    <div className="flex justify-center space-x-4 mb-4">
      <button
        className={`px-4 py-2 rounded text-white ${
          selectedDomain === "Event Organization" ? "bg-blue-600" : "bg-gray-700"
        }`}
        onClick={() => setSelectedDomain("Event Organization")}
      >
        Event Organization
      </button>
      <button
        className={`px-4 py-2 rounded text-white ${
          selectedDomain === "Budget Approvals" ? "bg-blue-600" : "bg-gray-700"
        }`}
        onClick={() => setSelectedDomain("Budget Approvals")}
      >
        Budget Approvals
      </button>
      <button
        className={`px-4 py-2 rounded text-white ${
          selectedDomain === "Sponsorships" ? "bg-blue-600" : "bg-gray-700"
        }`}
        onClick={() => setSelectedDomain("Sponsorships")}
      >
        Sponsorships
      </button>
    </div>
  );
};

// New component for submission instructions above the form
const SubmissionInstructions = () => {
  return (
    <div className="mb-4 p-4 bg-gray-700 rounded">
      <p className="text-center text-sm text-gray-300">
        Please select the application type
      </p>
    </div>
  );
};

// New component to show a summary of active applications
const ActiveApplicationsSummary = ({ count }) => {
  return (
    <div className="mb-4 p-2 bg-gray-700 rounded text-center">
      <p>Total Active Applications: {count}</p>
    </div>
  );
};

// New component to show a summary of processed applications
const ProcessedApplicationsSummary = ({ count }) => {
  return (
    <div className="mb-4 p-2 bg-gray-700 rounded text-center">
      <p>Total Processed Applications: {count}</p>
    </div>
  );
};

// New component to preview expense proof files locally on the browser
const ExpenseProofPreview = ({ files }) => {
  if (!files || files.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Expense Proof Preview</h3>
      <div className="flex flex-wrap gap-4">
        {files.map((file, idx) => {
          // For images, create an object URL for preview
          if (file.type.startsWith("image/")) {
            return (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt={`Expense Proof ${idx + 1}`}
                className="w-32 h-32 object-cover rounded"
              />
            );
          } else {
            // For non-image files, display the file name in a styled box
            return (
              <div key={idx} className="p-2 bg-gray-700 rounded">
                <p>{file.name}</p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

const TransparentApplication = () => {
  const [applications, setApplications] = useState([]);
  const [newApplication, setNewApplication] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [priority, setPriority] = useState("");
  const [expenseProofs, setExpenseProofs] = useState([]); // State for the attached files
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Simulated login for a student
  const login = () => {
    setUser({ id: "1", username: "student1", role: "student" });
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${backendUrl}/applications`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError("Failed to fetch applications: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newApplication.trim() || !selectedDomain || !priority) {
      setError("Please fill all required fields.");
      return;
    }
    if (expenseProofs.length === 0) {
      setError("Expense proofs are required for verification.");
      return;
    }
    if (!user) {
      setError("Please log in first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Build a data object for submission excluding expense proofs
      const data = {
        text: newApplication,
        domain: selectedDomain,
        priority,
        studentId: user.id,
        isAnonymous,
      };
      // Submit the application data to the backend without the files
      const res = await fetch(`${backendUrl}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Submission failed");
      await fetchApplications();
      // Clear text fields and other state but keep the expense proofs for display
      setNewApplication("");
      setSelectedDomain("");
      setPriority("");
      setIsAnonymous(false);
      // Note: We intentionally do not clear expenseProofs so that they remain visible in the preview.
    } catch (err) {
      setError("Failed to submit application: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 2000);
    return () => clearInterval(interval);
  }, []);

  // Separate applications by status: Active if still "Pending"; otherwise processed.
  const activeApplications = applications.filter((app) => app.status === "Pending");
  const processedApplications = applications.filter((app) => app.status !== "Pending");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 py-8 shadow-xl mb-10">
        <h1 className="text-5xl font-extrabold text-center">
          Student Application Submission Portal
        </h1>
      </header>
      <main className="px-6 md:px-12 max-w-5xl mx-auto">
        {/* Login Section */}
        {!user && (
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 p-2 bg-gray-700 rounded">
              <p className="text-sm text-gray-300">
                Please log in to submit an application.
              </p>
            </div>
            <button
              onClick={login}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded transition duration-200 shadow"
            >
              Login as Student
            </button>
          </div>
        )}
        {/* Application Submission Form */}
        {user && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-10">
            <SubmissionInstructions />
            {/* Render the new application type navbar */}
            <ApplicationNavbar
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
            />
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <select
                  className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <textarea
                  className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                  placeholder="Describe your application..."
                  value={newApplication}
                  onChange={(e) => setNewApplication(e.target.value)}
                  rows={4}
                  required
                ></textarea>
                {/* File input for expense proofs */}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => setExpenseProofs([...e.target.files])}
                  className="mb-2 p-2 bg-gray-700 text-white rounded"
                />
              </div>
              {/* Display a local preview of the selected expense proofs */}
              <ExpenseProofPreview files={expenseProofs} />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymous" className="ml-2">
                  Submit Anonymously
                </label>
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded shadow"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        )}

        {/* Display Active Applications */}
        {user && (
          <>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Active Applications</h2>
              <ActiveApplicationsSummary count={activeApplications.length} />
              {activeApplications.length === 0 ? (
                <p className="text-center">No active applications found.</p>
              ) : (
                <div className="grid gap-6">
                  {activeApplications.map((app) => (
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
                            {app.priority === "High" &&
                              app.status === "Pending" && (
                                <span className="ml-2 px-2 py-1 bg-red-600 text-xs font-bold rounded">
                                  Escalated
                                </span>
                              )}
                          </p>
                          <p className="text-sm text-gray-400">
                            Tracking ID: {app.trackingId}
                          </p>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                          <p className="text-sm text-gray-400">
                            {new Date(app.submissionDate).toLocaleString()}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            Status: {app.status}
                          </p>
                        </div>
                      </div>
                      {/* Display expense proofs if available from backend data */}
                      {app.expenseProofs && app.expenseProofs.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-700 rounded">
                          <p className="text-sm">Expense Proofs:</p>
                          <div className="flex space-x-2 mt-1">
                            {app.expenseProofs.map((fileUrl, idx) => (
                              <a
                                key={idx}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={fileUrl}
                                  alt={`Expense proof ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Display Processed Applications */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Processed Applications</h2>
              <ProcessedApplicationsSummary count={processedApplications.length} />
              {processedApplications.length === 0 ? (
                <p className="text-center">No processed applications found.</p>
              ) : (
                <div className="grid gap-6">
                  {processedApplications.map((app) => (
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
                            Priority: {app.priority}
                          </p>
                          <p className="text-sm text-gray-400">
                            Tracking ID: {app.trackingId}
                          </p>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                          <p className="text-sm text-gray-400">
                            {new Date(app.submissionDate).toLocaleString()}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            Status: {app.status}
                          </p>
                        </div>
                      </div>
                      {/* Display expense proofs if available from backend data */}
                      {app.expenseProofs && app.expenseProofs.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-700 rounded">
                          <p className="text-sm">Expense Proofs:</p>
                          <div className="flex space-x-2 mt-1">
                            {app.expenseProofs.map((fileUrl, idx) => (
                              <a
                                key={idx}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={fileUrl}
                                  alt={`Expense proof ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              </a>
                            ))}
                          </div>
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

export default TransparentApplication;
