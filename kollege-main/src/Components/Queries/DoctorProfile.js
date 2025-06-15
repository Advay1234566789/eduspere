import React, { useState } from 'react';

const doctorProfile = {
  name: "Dr. John Doe",
  specialty: "General Practitioner",
  email: "johndoe@example.com",
  phone: "(123) 456-7890",
  image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
  experience: "10 years of clinical practice",
  education: "MBBS, MD",
  hospital: "City Hospital"
};

const faqData = [
  {
    question: "What are Dr. John Doe's consultation hours?",
    answer: "Dr. John Doe is available from 9 AM to 5 PM on weekdays."
  },
  {
    question: "Does Dr. John Doe accept new patients?",
    answer: "Yes, Dr. John Doe is currently accepting new patients for consultation."
  },
  {
    question: "How can I book an appointment?",
    answer: "Appointments can be booked online through our hospital website or by calling the clinic directly."
  }
];

const DoctorProfile = () => {
  return (
    <div style={{
      maxWidth: "900px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      minHeight: "100vh",
      animation: "fadeIn 1s ease-in-out"
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .card {
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            transition: transform 0.3s ease;
          }
          .card:hover {
            transform: translateY(-5px);
          }
          .faq-item {
            background-color: #fff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          .faq-item:hover {
            background-color: #e6f7ff;
          }
          .faq-question {
            font-weight: bold;
            margin-bottom: 8px;
          }
          .faq-answer {
            display: none;
            margin-top: 10px;
            color: #555;
          }
          .faq-item.active .faq-answer {
            display: block;
          }
        `}
      </style>
      
      {/* Doctor Profile Section */}
      <div className="card" style={{ display: "flex", alignItems: "center" }}>
        <img 
          src={doctorProfile.image} 
          alt="Doctor Profile" 
          style={{
            width: "120px", 
            height: "120px", 
            borderRadius: "50%", 
            objectFit: "cover",
            marginRight: "20px"
          }} 
        />
        <div>
          <h2 style={{ margin: "0 0 8px", color: "#333", fontSize: "1.8rem" }}>{doctorProfile.name}</h2>
          <p style={{ margin: "4px 0", color: "#555" }}><strong>Specialty:</strong> {doctorProfile.specialty}</p>
          <p style={{ margin: "4px 0", color: "#555" }}><strong>Email:</strong> {doctorProfile.email}</p>
          <p style={{ margin: "4px 0", color: "#555" }}><strong>Phone:</strong> {doctorProfile.phone}</p>
          <p style={{ margin: "4px 0", color: "#555" }}><strong>Experience:</strong> {doctorProfile.experience}</p>
          <p style={{ margin: "4px 0", color: "#555" }}><strong>Education:</strong> {doctorProfile.education}</p>
          <p style={{ margin: "4px 0", color: "#555" }}><strong>Hospital:</strong> {doctorProfile.hospital}</p>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div>
        <h3 style={{ marginBottom: "20px", color: "#333" }}>Frequently Asked Questions</h3>
        {faqData.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [active, setActive] = useState(false);
  return (
    <div 
      className={`faq-item ${active ? "active" : ""}`}
      onClick={() => setActive(!active)}
    >
      <div className="faq-question">{question}</div>
      <div className="faq-answer">{answer}</div>
    </div>
  );
};

export default DoctorProfile;
