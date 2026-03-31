// src/components/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";
import {
  House,
  Book,
  Leaf,
  BarChart3,
  Activity,
  Droplet,
  CloudSun,
  ShoppingCart,
  LineChart,
  Shield,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

const menu = [
  { to: "/dashboard", label: "Dashboard", icon: <House size={18} /> },
  { to: "/land", label: "Land Profile", icon: <Book size={18} /> },
  { to: "/crop-recommendation", label: "Crop Recommendation", icon: <Leaf size={18} /> },
  { to: "/fertilizer", label: "Fertilizer Advisor", icon: <BarChart3 size={18} /> },
  { to: "/pesticide", label: "Pesticide Advisor", icon: <Activity size={18} /> },
  { to: "/irrigation", label: "Irrigation Scheduler", icon: <Droplet size={18} /> },
  { to: "/weather", label: "Weather Advisory", icon: <CloudSun size={18} /> },
  { to: "/market", label: "Market Price", icon: <ShoppingCart size={18} /> },
  { to: "/yield", label: "Crop Yield", icon: <LineChart size={18} /> },
  { to: "/disease", label: "Disease Prediction", icon: <Shield size={18} /> },
  { to: "/chat", label: "Farmer Chat", icon: <MessageSquare size={18} /> },
  { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
  { to: "/logout", label: "Log Out", icon: <LogOut size={18} /> },
];

export default function Sidebar() {
  return (
    <aside className="sidebar bg-dark text-white p-3 vh-100">
      <div className="sidebar-brand text-center mb-4">
        <div className="brand-emoji">🌱</div>
        <div className="brand-text">AgriGenius AI</div>
      </div>

      <nav>
        <ul className="nav flex-column">
          {menu.map((item) => (
            <li className="nav-item mb-2" key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center text-white px-2 py-2 rounded " +
                  (isActive ? "active" : "")
                }
                end
              >
                <span className="me-2 icon">{item.icon}</span>
                <span className="link-text">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}


