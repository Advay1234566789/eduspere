// // BookingSystem.js
// import React, { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   LineChart, Line, PieChart, Pie, Cell
// } from 'recharts';
// import { BookOpen } from 'lucide-react';

// const socket = io('http://localhost:5500');

// function App() {
//   return (
//     <div>
//       <BookingSystem />
//     </div>
//   );
// }

// // =====================
// // Booking System Module
// // =====================
// const BookingSystem = () => {
//   // view can be 'dashboard' or 'bookings'
//   const [view, setView] = useState('dashboard');
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // For demonstration, we set userRole; in a real app, use authentication.
//   const [userRole] = useState('user'); 
//   // Store the new booking details so we can display it or update state.
//   const [lastBooking, setLastBooking] = useState(null);

//   // Function to update booking status (used in the booking manager view)
//   const updateBookingStatus = async (id, status) => {
//     try {
//       await fetch(`http://localhost:5500/bookings/${id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status }),
//       });
//       // fetchBookings() will be triggered via socket update.
//     } catch (error) {
//       console.error('Error updating status:', error);
//     }
//   };

//   const fetchBookings = async () => {
//     try {
//       const response = await fetch('http://localhost:5500/bookings');
//       const data = await response.json();
//       setBookings(data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching bookings:', error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookings();

//     socket.on('newBooking', (booking) => {
//       setBookings(prev => [booking, ...prev]);
//     });

//     socket.on('bookingUpdated', (updatedBooking) => {
//       setBookings(prev =>
//         prev.map(booking =>
//           booking._id === updatedBooking._id ? updatedBooking : booking
//         )
//       );
//     });

//     return () => {
//       socket.off('newBooking');
//       socket.off('bookingUpdated');
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {/* Navbar */}
//       <nav className="bg-gray-800 shadow-lg">
//         <div className="max-w-6xl mx-auto px-4">
//           <div className="flex items-center space-x-8">
//             <button
//               onClick={() => setView('dashboard')}
//               className={`flex items-center space-x-2 px-3 py-2 rounded-md ${view === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-300'}`}
//             >
//               <span>Real-Time Dashboard</span>
//             </button>
//             <button
//               onClick={() => setView('bookings')}
//               className={`flex items-center space-x-2 px-3 py-2 rounded-md ${view === 'bookings' ? 'bg-blue-100 text-blue-600' : 'text-gray-300'}`}
//             >
//               <BookOpen size={20} />
//               <span>Booking Manager</span>
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto p-8">
//         {loading ? (
//           <p>Loading bookings...</p>
//         ) : (
//           view === 'dashboard' ? (
//             <Dashboard bookings={bookings} />
//           ) : view === 'bookings' ? (
//             <BookingView 
//               bookings={bookings}
//               userRole={userRole}
//               onBookingUpdate={updateBookingStatus}
//               onBookingSubmit={async (bookingData) => {
//                 try {
//                   // Submit the new booking.
//                   const res = await fetch('http://localhost:5500/bookings', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(bookingData),
//                   });
//                   const newBooking = await res.json();
//                   // Save the new booking details and return to the dashboard.
//                   setLastBooking(newBooking);
//                   setView('dashboard');
//                 } catch (error) {
//                   console.error('Error submitting booking:', error);
//                 }
//               }}
//             />
//           ) : null
//         )}
//       </div>
//     </div>
//   );
// };

// const Dashboard = ({ bookings }) => {
//   const recentBookings = [...bookings].slice(0, 5);
//   return (
//     <div className="space-y-8">
//       <h1 className="text-3xl font-bold text-blue-100">Booking Analytics Dashboard</h1>
//       <div className="bg-gray-800 rounded shadow p-4">
//         <h2 className="text-xl font-bold mb-2">Recent Bookings</h2>
//         <table className="min-w-full divide-y divide-gray-700">
//           <thead>
//             <tr>
//               <th className="px-4 py-2 text-left">Resource</th>
//               <th className="px-4 py-2 text-left">Date</th>
//               <th className="px-4 py-2 text-left">Time</th>
//               <th className="px-4 py-2 text-left">Status</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-700">
//             {recentBookings.map(booking => (
//               <tr key={booking._id}>
//                 <td className="px-4 py-2">{booking.resource}</td>
//                 <td className="px-4 py-2">{booking.date}</td>
//                 <td className="px-4 py-2">{booking.time}</td>
//                 <td className="px-4 py-2">{booking.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// const BookingView = ({ bookings, userRole, onBookingUpdate, onBookingSubmit }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const filteredBookings = bookings.filter(booking => 
//     booking.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     booking.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     booking.status.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-8">
//       <h1 className="text-3xl font-bold text-blue-100">Booking Manager</h1>
      
//       {/* Search Filter */}
//       <div className="mb-4">
//         <input 
//           type="text" 
//           placeholder="Search bookings..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-4 py-2 border border-gray-600 rounded-md w-full bg-gray-800 text-white"
//         />
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <BookingForm onSubmit={onBookingSubmit} />
//         <BookingStats bookings={bookings} />
//       </div>

//       <BookingList 
//         bookings={filteredBookings}
//         isAdmin={userRole === 'admin'}
//         onUpdateStatus={onBookingUpdate}
//       />
//     </div>
//   );
// };

// const BookingForm = ({ onSubmit }) => {
//   const [formData, setFormData] = useState({
//     resource: '',
//     date: '',
//     time: '',
//     duration: '',
//     details: '',
//     submittedBy: ''
//   });

//   const handleChange = (e) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if(formData.resource && formData.date && formData.time && formData.duration && formData.submittedBy) {
//       onSubmit(formData);
//       setFormData({
//         resource: '',
//         date: '',
//         time: '',
//         duration: '',
//         details: '',
//         submittedBy: ''
//       });
//     } else {
//       alert('Please fill in all required fields.');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded shadow">
//       <h2 className="text-xl font-bold mb-4">New Booking</h2>
//       <div className="mb-2">
//         <label className="block">Resource</label>
//         <input 
//           type="text" 
//           name="resource" 
//           value={formData.resource} 
//           onChange={handleChange}
//           placeholder="e.g., Auditorium A"
//           className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
//           required
//         />
//       </div>
//       <div className="mb-2">
//         <label className="block">Date</label>
//         <input 
//           type="date" 
//           name="date" 
//           value={formData.date} 
//           onChange={handleChange}
//           className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
//           required
//         />
//       </div>
//       <div className="mb-2">
//         <label className="block">Time</label>
//         <input 
//           type="time" 
//           name="time" 
//           value={formData.time} 
//           onChange={handleChange}
//           className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
//           required
//         />
//       </div>
//       <div className="mb-2">
//         <label className="block">Duration (minutes)</label>
//         <input 
//           type="number" 
//           name="duration" 
//           value={formData.duration} 
//           onChange={handleChange}
//           className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
//           required
//         />
//       </div>
//       <div className="mb-2">
//         <label className="block">Details</label>
//         <textarea 
//           name="details" 
//           value={formData.details} 
//           onChange={handleChange}
//           className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
//         />
//       </div>
//       <div className="mb-2">
//         <label className="block">Submitted By</label>
//         <input 
//           type="text" 
//           name="submittedBy" 
//           value={formData.submittedBy} 
//           onChange={handleChange}
//           placeholder="Your Name"
//           className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
//           required
//         />
//       </div>
//       <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
//         Submit Booking
//       </button>
//     </form>
//   );
// };

// const BookingStats = ({ bookings }) => {
//   const total = bookings.length;
//   const approved = bookings.filter(b => b.status === 'Approved').length;
//   const rejected = bookings.filter(b => b.status === 'Rejected').length;

//   return (
//     <div className="p-4 bg-gray-800 rounded shadow">
//       <h2 className="text-xl font-bold mb-4">Booking Stats</h2>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="p-2 bg-blue-700 rounded">
//           <h3 className="font-bold">Total</h3>
//           <p>{total}</p>
//         </div>
//         <div className="p-2 bg-green-700 rounded">
//           <h3 className="font-bold">Approved</h3>
//           <p>{approved}</p>
//         </div>
//         <div className="p-2 bg-red-700 rounded">
//           <h3 className="font-bold">Rejected</h3>
//           <p>{rejected}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// const BookingList = ({ bookings, isAdmin, onUpdateStatus }) => {
//   return (
//     <div className="mt-8 bg-gray-800 rounded shadow p-4">
//       <h2 className="text-xl font-bold mb-4">Booking List</h2>
//       <table className="min-w-full divide-y divide-gray-700">
//         <thead>
//           <tr>
//             <th className="px-4 py-2 text-left">Resource</th>
//             <th className="px-4 py-2 text-left">Date</th>
//             <th className="px-4 py-2 text-left">Time</th>
//             <th className="px-4 py-2 text-left">Duration</th>
//             <th className="px-4 py-2 text-left">Status</th>
//             {isAdmin && <th className="px-4 py-2 text-left">Actions</th>}
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-700">
//           {bookings.map(booking => (
//             <tr key={booking._id}>
//               <td className="px-4 py-2">{booking.resource}</td>
//               <td className="px-4 py-2">{booking.date}</td>
//               <td className="px-4 py-2">{booking.time}</td>
//               <td className="px-4 py-2">{booking.duration} mins</td>
//               <td className="px-4 py-2">{booking.status}</td>
//               {isAdmin && (
//                 <td className="px-4 py-2">
//                   {booking.status === 'Pending' && (
//                     <>
//                       <button 
//                         onClick={() => onUpdateStatus(booking._id, 'Approved')}
//                         className="mr-2 bg-green-500 text-white px-2 py-1 rounded"
//                       >
//                         Accept
//                       </button>
//                       <button 
//                         onClick={() => onUpdateStatus(booking._id, 'Rejected')}
//                         className="bg-red-500 text-white px-2 py-1 rounded"
//                       >
//                         Reject
//                       </button>
//                     </>
//                   )}
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default App;


// BookingSystem.js


import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { BookOpen } from 'lucide-react';

const socket = io('http://localhost:5500');

function App() {
  return (
    <div>
      <BookingSystem />
    </div>
  );
}

// =====================
// Booking System Module
// =====================
const BookingSystem = () => {
  // view can be 'dashboard' or 'bookings'
  const [view, setView] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  // For demonstration, we set userRole; in a real app, use authentication.
  const [userRole] = useState('user'); 
  // Store the new booking details so we can display it or update state.
  const [lastBooking, setLastBooking] = useState(null);
  // New state for showing/hiding the Slot Checker feature.
  const [showSlotChecker, setShowSlotChecker] = useState(false);

  // Function to update booking status (used in the booking manager view)
  const updateBookingStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5500/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      // fetchBookings() will be triggered via socket update.
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5500/bookings');
      const data = await response.json();
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    socket.on('newBooking', (booking) => {
      setBookings(prev => [booking, ...prev]);
    });

    socket.on('bookingUpdated', (updatedBooking) => {
      setBookings(prev =>
        prev.map(booking =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        )
      );
    });

    return () => {
      socket.off('newBooking');
      socket.off('bookingUpdated');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => {
                setView('dashboard');
                setShowSlotChecker(false);
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md ${view === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-300'}`}
            >
              <span>Real-Time Dashboard</span>
            </button>
            <button
              onClick={() => {
                setView('bookings');
                setShowSlotChecker(false);
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md ${view === 'bookings' ? 'bg-blue-100 text-blue-600' : 'text-gray-300'}`}
            >
              <BookOpen size={20} />
              <span>Booking Manager</span>
            </button>
            {/* New Navbar Button for Slot Checker */}
            <button
              onClick={() => setShowSlotChecker(true)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md ${showSlotChecker ? 'bg-blue-100 text-blue-600' : 'text-gray-300'}`}
            >
              <span>Check Slot</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        {loading ? (
          <p>Loading bookings...</p>
        ) : (
          showSlotChecker ? (
            // When Check Slot is active, render only the SlotChecker.
            <SlotChecker bookings={bookings} onClose={() => setShowSlotChecker(false)} />
          ) : (
            // Otherwise, render the main view (Dashboard or Booking Manager).
            view === 'dashboard' ? (
              <Dashboard bookings={bookings} />
            ) : view === 'bookings' ? (
              <BookingView 
                bookings={bookings}
                userRole={userRole}
                onBookingUpdate={updateBookingStatus}
                onBookingSubmit={async (bookingData) => {
                  try {
                    // Submit the new booking.
                    const res = await fetch('http://localhost:5500/bookings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(bookingData),
                    });
                    const newBooking = await res.json();
                    // Save the new booking details and return to the dashboard.
                    setLastBooking(newBooking);
                    setView('dashboard');
                  } catch (error) {
                    console.error('Error submitting booking:', error);
                  }
                }}
              />
            ) : null
          )
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ bookings }) => {
  const recentBookings = [...bookings].slice(0, 5);
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-100">Booking Analytics Dashboard</h1>
      <div className="bg-gray-800 rounded shadow p-4">
        <h2 className="text-xl font-bold mb-2">Recent Bookings</h2>
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Resource</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {recentBookings.map(booking => (
              <tr key={booking._id}>
                <td className="px-4 py-2">{booking.resource}</td>
                <td className="px-4 py-2">{booking.date}</td>
                <td className="px-4 py-2">{booking.time}</td>
                <td className="px-4 py-2">{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BookingView = ({ bookings, userRole, onBookingUpdate, onBookingSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredBookings = bookings.filter(booking => 
    booking.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-100">Booking Manager</h1>
      
      {/* Search Filter */}
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-md w-full bg-gray-800 text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BookingForm onSubmit={onBookingSubmit} />
        <BookingStats bookings={bookings} />
      </div>

      <BookingList 
        bookings={filteredBookings}
        isAdmin={userRole === 'admin'}
        onUpdateStatus={onBookingUpdate}
      />
    </div>
  );
};

const BookingForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    resource: '',
    date: '',
    time: '',
    duration: '',
    details: '',
    submittedBy: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData.resource && formData.date && formData.time && formData.duration && formData.submittedBy) {
      onSubmit(formData);
      setFormData({
        resource: '',
        date: '',
        time: '',
        duration: '',
        details: '',
        submittedBy: ''
      });
    } else {
      alert('Please fill in all required fields.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded shadow">
      <h2 className="text-xl font-bold mb-4">New Booking</h2>
      <div className="mb-2">
        <label className="block">Resource</label>
        <input 
          type="text" 
          name="resource" 
          value={formData.resource} 
          onChange={handleChange}
          placeholder="e.g., Auditorium A"
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block">Date</label>
        <input 
          type="date" 
          name="date" 
          value={formData.date} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block">Time</label>
        <input 
          type="time" 
          name="time" 
          value={formData.time} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block">Duration (minutes)</label>
        <input 
          type="number" 
          name="duration" 
          value={formData.duration} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block">Details</label>
        <textarea 
          name="details" 
          value={formData.details} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
        />
      </div>
      <div className="mb-2">
        <label className="block">Submitted By</label>
        <input 
          type="text" 
          name="submittedBy" 
          value={formData.submittedBy} 
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Submit Booking
      </button>
    </form>
  );
};

const BookingStats = ({ bookings }) => {
  const total = bookings.length;
  const approved = bookings.filter(b => b.status === 'Approved').length;
  const rejected = bookings.filter(b => b.status === 'Rejected').length;

  return (
    <div className="p-4 bg-gray-800 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Booking Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-2 bg-blue-700 rounded">
          <h3 className="font-bold">Total</h3>
          <p>{total}</p>
        </div>
        <div className="p-2 bg-green-700 rounded">
          <h3 className="font-bold">Approved</h3>
          <p>{approved}</p>
        </div>
        <div className="p-2 bg-red-700 rounded">
          <h3 className="font-bold">Rejected</h3>
          <p>{rejected}</p>
        </div>
      </div>
    </div>
  );
};

const BookingList = ({ bookings, isAdmin, onUpdateStatus }) => {
  return (
    <div className="mt-8 bg-gray-800 rounded shadow p-4">
      <h2 className="text-xl font-bold mb-4">Booking List</h2>
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Resource</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Time</th>
            <th className="px-4 py-2 text-left">Duration</th>
            <th className="px-4 py-2 text-left">Status</th>
            {isAdmin && <th className="px-4 py-2 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {bookings.map(booking => (
            <tr key={booking._id}>
              <td className="px-4 py-2">{booking.resource}</td>
              <td className="px-4 py-2">{booking.date}</td>
              <td className="px-4 py-2">{booking.time}</td>
              <td className="px-4 py-2">{booking.duration} mins</td>
              <td className="px-4 py-2">{booking.status}</td>
              {isAdmin && (
                <td className="px-4 py-2">
                  {booking.status === 'Pending' && (
                    <>
                      <button 
                        onClick={() => onUpdateStatus(booking._id, 'Approved')}
                        className="mr-2 bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(booking._id, 'Rejected')}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================
// New Component: SlotChecker
// ============================
const SlotChecker = ({ bookings, onClose }) => {
  const [formData, setFormData] = useState({
    resource: '',
    date: '',
    time: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const checkSlot = async (e) => {
    e.preventDefault();
    const { resource, date, time } = formData;
    // Check if the entered slot is already booked (case-insensitive for resource)
    const isBooked = bookings.some(booking =>
      booking.resource.toLowerCase() === resource.toLowerCase() &&
      booking.date === date &&
      booking.time === time
    );

    if (isBooked) {
      setMessage('Sorry, the slot is booked');
    } else {
      // Proceed as usual in code that will send the request to HOD.
      try {
        await fetch('http://localhost:5500/request-hod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setMessage('Slot available. Request sent to HOD.');
      } catch (error) {
        console.error('Error sending request to HOD:', error);
        setMessage('Error sending request to HOD.');
      }
    }
  };

  return (
    <div className="p-4 bg-gray-700 rounded shadow my-4">
      <h2 className="text-xl font-bold mb-4">Check Slot Availability</h2>
      <form onSubmit={checkSlot}>
        <div className="mb-2">
          <label className="block">Resource</label>
          <input 
            type="text" 
            name="resource" 
            value={formData.resource} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Date</label>
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Time</label>
          <input 
            type="time" 
            name="time" 
            value={formData.time} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Check Availability
        </button>
        <button type="button" onClick={onClose} className="mt-4 ml-2 bg-gray-600 text-white px-4 py-2 rounded">
          Close
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default App;



