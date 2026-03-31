// src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import { User, Mail, MapPin, Sprout, FlaskConical } from "lucide-react";
import "./Dashboard.css";
import "./UpdatesTicker.css";

// Helper: Decode JWT manually
function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch (error) {
    return null;
  }
}

const Dashboard = () => {

  const [user, setUser] = useState(null);
  const [land, setLand] = useState(null);

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    // 1️⃣ Fetch User Details
    fetch("http://127.0.0.1:5000/api/auth/get_user/" + userId)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.log("User fetch error:", err));

    // 2️⃣ Fetch Land Profile
    fetch("http://127.0.0.1:5000/api/land/user/" + userId)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) setLand(data[0]); // Use first land profile
      })
      .catch((err) => console.log("Land fetch error:", err));
  }, []);

  const updates = [
    "🌱 New crop disease alert in Andhra Pradesh region",
    "💧 Rain expected in Telangana for next 3 days",
    "📈 Tomato market price increased by 12% this week",
    "🚜 New fertilizer subsidy announced by Govt."
  ];

  return (
    <div className="p-4">

      {/* 🔔 Updates Bar */}
      <div className="updates-bar mb-4">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          {updates.map((update, index) => (
            <span key={index} className="update-item">
              {update} &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </marquee>
      </div>

      <h2 className="mb-4">Dashboard Overview</h2>

      {/* 🔹 Farmer Details Section */}
      <div className="row">

        {/* Farmer Name */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3 text-center">
            <div className="mb-2 text-success"><User size={28} /></div>
            <h5>Farmer Name</h5>
            <p className="text-muted">{user ? user.username : "Loading..."}</p>
          </div>
        </div>

        {/* Email */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3 text-center">
            <div className="mb-2 text-success"><Mail size={28} /></div>
            <h5>Email</h5>
            <p className="text-muted">{user ? user.email : "Loading..."}</p>
          </div>
        </div>

        {/* Address */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3 text-center">
            <div className="mb-2 text-success"><MapPin size={28} /></div>
            <h5>Address</h5>
            <p className="text-muted">
              {land ? land.location : "Add land profile"}
            </p>
          </div>
        </div>

        {/* Soil Type */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3 text-center">
            <div className="mb-2 text-success"><Sprout size={28} /></div>
            <h5>Soil Type</h5>
            <p className="text-muted">
              {land ? land.soil_type : "Add land profile"}
            </p>
          </div>
        </div>

        {/* Soil pH */}
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3 text-center">
            <div className="mb-2 text-success"><FlaskConical size={28} /></div>
            <h5>Soil pH</h5>
            <p className="text-muted">
              {land ? land.ph : "Add land profile"}
            </p>
          </div>
        </div>

      </div>

      {/* About Section */}
      <div className="mt-5 p-4 bg-white shadow rounded">
        <h4 className="text-success">About AgriGenius AI</h4>
        <ul className="text-muted">
          <li>AI-powered crop recommendation based on soil & weather data</li>
          <li>Fertilizer & pesticide guidance for sustainable farming</li>
          <li>Irrigation scheduling with smart water management</li>
          <li>Weather advisory & early disease detection alerts</li>
          <li>Market price prediction for better selling decisions</li>
          <li>Farmer chatbot support for instant help</li>
        </ul>
      </div>

      <footer className="text-center mt-4 p-3 bg-light border-top">
        <small>© {new Date().getFullYear()} AgriGenius AI | All Rights Reserved.</small>
      </footer>

    </div>
  );
};

export default Dashboard;
