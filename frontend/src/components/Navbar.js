import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import "./Navbar.css";

const API_BASE = "http://127.0.0.1:5000/api/settings";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const dropdownRef = useRef(null);

  const userId = (() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
      return json.user_id || null;
    } catch {
      return null;
    }
  })();

  // Fetch user info
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${API_BASE}/get/${userId}`)
      .then((res) => {
        const data = res.data;
        setUserName(data.username || "User");
        setProfilePhoto(data.profile_image || null); // already full URL
        localStorage.setItem("name", data.username || "User");
        localStorage.setItem("profile_photo", data.profile_image || "");
      })
      .catch((err) => {
        console.error("Navbar: failed to load user data", err);
      });
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileImg = profilePhoto
    ? profilePhoto // use full URL from backend
    : "/default-user.png";

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4 shadow-sm">
      <span className="navbar-brand fw-bold">AgriGenius AI Dashboard</span>

      <div className="ms-auto d-flex align-items-center">
        <Bell className="me-4" size={20} />

        {/* Custom Dropdown */}
        <div className="position-relative" ref={dropdownRef}>
          <button
            className="btn btn-outline-dark d-flex align-items-center"
            onClick={() => setOpen(!open)}
          >
            <img
              src={profileImg}
              alt="Profile"
              className="rounded-circle me-2"
              width="30"
              height="30"
              style={{ objectFit: "cover" }}
            />
            <span>Profile ▾</span>
          </button>

          {open && (
            <div
              className="dropdown-menu show p-3 shadow dropdown-menu-end"
              style={{
                position: "absolute",
                right: 0,
                top: "110%",
                width: "250px",
                borderRadius: "10px",
              }}
            >
              {/* Profile Image + Username */}
              <div
                className="text-center mb-3"
                style={{
                  paddingBottom: "10px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <img
                  src={profileImg}
                  alt="Profile"
                  className="rounded-circle mb-2"
                  width="80"
                  height="80"
                  style={{ objectFit: "cover" }}
                />
                <h6 className="fw-bold mb-0">{userName}</h6>
              </div>

              {/* Buttons in same row */}
              <div className="d-flex mt-3">
                <button
                  className="btn btn-light w-50 me-2"
                  onClick={() => (window.location.href = "/settings")}
                >
                  Settings
                </button>
                <button
                  className="btn btn-light w-50 text-danger"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
