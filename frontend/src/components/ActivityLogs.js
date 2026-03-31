import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Settings.css";

const API_BASE = "http://127.0.0.1:5000/api/settings";

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(window.atob(payload)))).user_id;
  } catch {
    return null;
  }
}

export default function ActivityLogs() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getUserIdFromToken();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    loadLogs();
    // eslint-disable-next-line
  }, [userId, location.state?.refresh]);

  function humanizeField(f) {
    return f.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
  }
  function friendlyValue(v) {
    if (v === true) return "On";
    if (v === false) return "Off";
    if (v === null || v === undefined) return "None";
    return String(v);
  }

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/activity_logs/${userId}`, {
        headers: localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {},
      });
      const raw = res.data || [];
      const formatted = raw.map((l) => {
        let details = "";
        try {
          if (l.meta && l.meta.changes && Array.isArray(l.meta.changes)) {
            // Generic field changes
            details = l.meta.changes
              .map((c) => `${humanizeField(c.field)} changed from ${friendlyValue(c.old)} → ${friendlyValue(c.new)}`)
              .join("; ");
          } else if (l.meta && l.meta.new_photo !== undefined) {
            // Photo updates
            details = `Old Photo: ${l.meta.old_photo ? l.meta.old_photo.split("/").pop() : "None"} → New Photo: ${l.meta.new_photo.split("/").pop()}`;
          } else if (l.meta && Object.keys(l.meta).length) {
            details = JSON.stringify(l.meta);
          }
        } catch {
          details = JSON.stringify(l.meta);
        }
        return { id: l.id, event: l.event, details, created_at: l.created_at };
      });
      setLogs(formatted);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="settings-root">
      <div className="settings-container">
        <h2 className="settings-title">Activity Logs</h2>

        <div className="activity-card">
          {loading && <div className="muted">Loading...</div>}
          {!loading && logs.length === 0 && <div className="muted">No activity logs found.</div>}

          <div className="logs-list-full">
            {logs.map((l) => (
              <div key={l.id} className="log-item-full">
                <div className="log-event-full">{l.event}</div>
                {l.details && <div className="log-meta-full">{l.details}</div>}
                <div className="log-time-full">{new Date(l.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="outline-btn" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
