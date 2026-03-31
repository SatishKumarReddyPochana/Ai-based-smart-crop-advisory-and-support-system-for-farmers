import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import LandProfile from "./components/LandProfile";
import CropRecommendation from "./components/CropRecommendation";
import FertilizerAdvisor from "./components/FertilizerAdvisor";
import PesticideAdvisor from "./components/PesticideAdvisor";
import IrrigationScheduler from "./components/IrrigationScheduler";
import WeatherAdvisory from "./components/WeatherAdvisory";
import CropYield from "./components/CropYield";
import MarketPrice from "./components/MarketPrice";
import DiseaseDetection from "./components/DiseaseDetection";
import Chatbot from "./components/Chatbot";

// ✅ Add this import  
import Settings from "./components/settings";
import ActivityLogs from "./components/ActivityLogs";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/activity-logs" element={<ActivityLogs />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <Dashboard />
              </div>
            </div>
          }
        />

        {/* Land */}
        <Route
          path="/land"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <LandProfile />
              </div>
            </div>
          }
        />

        {/* Crop Recommendation */}
        <Route
          path="/crop-recommendation"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <CropRecommendation />
              </div>
            </div>
          }
        />

        {/* Fertilizer Advisor */}
        <Route
          path="/fertilizer"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <FertilizerAdvisor />
              </div>
            </div>
          }
        />

        {/* Pesticide Advisor */}
        <Route
          path="/pesticide"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <PesticideAdvisor />
              </div>
            </div>
          }
        />

        {/* Irrigation */}
        <Route
          path="/irrigation"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <IrrigationScheduler />
              </div>
            </div>
          }
        />

        {/* Weather */}
        <Route
          path="/weather"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <WeatherAdvisory />
              </div>
            </div>
          }
        />

        {/* Yield */}
        <Route
          path="/yield"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <CropYield />
              </div>
            </div>
          }
        />

        {/* Market */}
        <Route
          path="/market"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <MarketPrice />
              </div>
            </div>
          }
        />

        {/* Disease */}
        <Route
          path="/disease"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <DiseaseDetection />
              </div>
            </div>
          }
        />

        {/* Chat */}
        <Route
          path="/chat"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <Chatbot />
              </div>
            </div>
          }
        />

        {/* ✅ Settings Page Route (NEW) */}
        <Route
          path="/settings"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="main-content flex-grow-1">
                <Navbar />
                <Settings />
              </div>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;











