import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const API_BASE = "http://127.0.0.1:5000/api/settings";

// Decode JWT to get user_id
function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
    return json.user_id || json.userId || null;
  } catch {
    return null;
  }
}

export default function Settings() {
  const navigate = useNavigate();
  const userId = getUserIdFromToken();

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [profile, setProfile] = useState({
    id: null,
    username: "",
    email: "",
    profile_image_url: ""
  });

  const [appSettings, setAppSettings] = useState({
    dark_mode: false,
    language: "English",
    notifications_enabled: true
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [showPwModal, setShowPwModal] = useState(false);
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);

  const [show2StepModal, setShow2StepModal] = useState(false);

  useEffect(() => {
    if (!userId) navigate("/login");
    else loadSettings();
    // eslint-disable-next-line
  }, []);

  function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function loadSettings() {
    setLoading(true);
    setPageError(null);
    try {
      const res = await axios.get(`${API_BASE}/get/${userId}`, { headers: authHeaders() });
      const d = res.data;
      setProfile({
        id: d.id,
        username: d.username || "",
        email: d.email || "",
        profile_image_url: d.profile_image || ""
      });
      setAppSettings({
        dark_mode: !!d.dark_mode,
        language: d.language || "English",
        notifications_enabled: !!d.notifications_enabled
      });
    } catch (err) {
      console.error(err);
      setPageError("Unable to load settings from server.");
    } finally {
      setLoading(false);
    }
  }

  // ------------------ Photo Upload ------------------
  function onPhotoSelect(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function handleUploadPhoto() {
    if (!photoFile) {
      setNotice({ type: "error", text: "Choose a photo first." });
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const fd = new FormData();
      fd.append("user_id", userId);
      fd.append("photo", photoFile);
      const res = await axios.post(`${API_BASE}/upload_photo`, fd, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });

      const uploadedPhoto = res.data.photo_url.startsWith("http")
        ? `${res.data.photo_url}?t=${Date.now()}`
        : `http://127.0.0.1:5000/${res.data.photo_url}?t=${Date.now()}`;

      setProfile((prev) => ({ ...prev, profile_image_url: uploadedPhoto }));
      setPhotoFile(null);
      setPhotoPreview(null);
      setNotice({ type: "success", text: res.data.message || "Photo uploaded successfully." });
    } catch (err) {
      console.error(err);
      setNotice({ type: "error", text: err?.response?.data?.error || "Photo upload failed." });
    } finally {
      setLoading(false);
    }
  }

  // ------------------ Save App Settings ------------------
  async function handleSaveAppSettings() {
    setLoading(true);
    setNotice(null);
    try {
      await axios.post(
        `${API_BASE}/update_profile`,
        { user_id: userId, username: profile.username, email: profile.email },
        { headers: authHeaders() }
      );

      await axios.post(
        `${API_BASE}/update_app_settings`,
        { user_id: userId, dark_mode: !!appSettings.dark_mode, language: appSettings.language, notifications_enabled: !!appSettings.notifications_enabled },
        { headers: authHeaders() }
      );

      setNotice({ type: "success", text: "Settings saved successfully." });
      await loadSettings();
    } catch (err) {
      console.error(err);
      setNotice({ type: "error", text: err?.response?.data?.error || "Saving settings failed." });
    } finally {
      setLoading(false);
    }
  }

  // ------------------ Password Change ------------------
  async function handleChangePassword() {
    if (!pwOld || !pwNew) {
      setPwError("Enter both old and new password.");
      return;
    }
    setPwLoading(true);
    setPwError(null);
    try {
      await axios.post(
        `${API_BASE}/change_password`,
        { user_id: userId, old_password: pwOld, new_password: pwNew },
        { headers: authHeaders() }
      );
      setPwOld("");
      setPwNew("");
      setShowPwModal(false);
      setNotice({ type: "success", text: "Password changed successfully." });
    } catch (err) {
      console.error(err);
      setPwError(err?.response?.data?.error || "Password change failed.");
    } finally {
      setPwLoading(false);
    }
  }

  // ------------------ Delete Account ------------------
  async function handleDeleteAccount() {
    if (!window.confirm("Delete account permanently? This cannot be undone.")) return;
    setLoading(true);
    setNotice(null);
    try {
      await axios.post(`${API_BASE}/delete_account`, { user_id: userId }, { headers: authHeaders() });
      setNotice({ type: "success", text: "Account deleted. Logging out..." });
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.error || "";
      if (serverMsg.toLowerCase().includes("foreign key")) {
        setNotice({ type: "error", text: "Cannot delete account. Remove related profiles first." });
      } else setNotice({ type: "error", text: serverMsg || "Account deletion failed." });
    } finally {
      setLoading(false);
    }
  }

  function openActivityLogs() {
    navigate("/settings/activity-logs", { state: { refresh: true } });
  }

  return (
    <div className="settings-root">
      <div className="settings-container">
        <h2 className="settings-title">Settings</h2>

        {pageError && <div className="settings-alert error">{pageError}</div>}
        {notice && <div className={`settings-alert ${notice.type === "error" ? "error" : "success"}`}>{notice.text}</div>}

        <div className="settings-card">
          {/* Left Column: Profile & Account */}
          <div className="left-col">
            <h3 className="section-title">Account & Profile</h3>

            <div className="profile-row">
              <div className="avatar-wrap">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="avatar-img" />
                ) : profile.profile_image_url ? (
                  <img src={profile.profile_image_url} alt="profile" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder" />
                )}
              </div>

              <div className="upload-column">
                <label className="file-label">
                  <input type="file" accept="image/*" onChange={onPhotoSelect} />
                  <span className="upload-btn">Choose Photo</span>
                </label>
                <button className="upload-action" onClick={handleUploadPhoto} disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Upload"}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Update Name</label>
              <input className="form-input" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
            </div>

            <div className="form-row">
              <label className="form-label">Update Email</label>
              <input className="form-input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>

            <div className="actions-row">
              <button className="outline-btn" onClick={() => setShowPwModal(true)}>Change Password</button>
              <button className="danger-btn" onClick={handleDeleteAccount}>Delete Account</button>
            </div>
          </div>

          {/* Right Column: App Settings */}
          <div className="right-col">
            <h3 className="section-title">App Settings</h3>
            <div className="setting-row">
              <div>Dark Mode</div>
              <label className="switch">
                <input type="checkbox" checked={!!appSettings.dark_mode} onChange={(e) => setAppSettings({ ...appSettings, dark_mode: e.target.checked })} />
                <span className="slider round" />
              </label>
            </div>

            <div className="setting-row">
              <div>Language</div>
              <select className="language-select" value={appSettings.language} onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}>
                <option>English</option>
                <option>Hindi</option>
                <option>Telugu</option>
              </select>
            </div>

            <div className="spacer" />

            <h3 className="section-title">Alert & Notification Settings</h3>
            <div className="setting-row">
              <div>Enable Notifications</div>
              <label className="switch">
                <input type="checkbox" checked={!!appSettings.notifications_enabled} onChange={(e) => setAppSettings({ ...appSettings, notifications_enabled: e.target.checked })} />
                <span className="slider round" />
              </label>
            </div>

            <div className="divider" />

            <h3 className="section-title">Privacy & Security</h3>
            <div className="list-row" onClick={() => setShow2StepModal(true)}>
              <div>Two-Step Verification</div>
              <div className="chev">&gt;</div>
            </div>
            <div className="list-row" onClick={openActivityLogs}>
              <div>Activity Logs</div>
              <div className="chev">&gt;</div>
            </div>

            <div className="divider" />

            <h3 className="section-title">Contact & Support</h3>
            <div className="contact-item">Email: <strong>support@agrigenius.com</strong></div>
            <div className="contact-item">Phone: <strong>123-456-7890</strong></div>

            <button className="save-main full-width" onClick={handleSaveAppSettings} disabled={loading}>
              {loading ? "Saving..." : "Save App Settings"}
            </button>
          </div>
        </div>

        <div className="settings-footer">© {new Date().getFullYear()} AgriGenius AI | All rights reserved.</div>
      </div>

      {/* Change Password Modal */}
      <Modal show={showPwModal} onHide={() => setShowPwModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pwError && <div className="settings-alert error">{pwError}</div>}
          <label className="form-label">Old Password</label>
          <input className="form-input" type="password" value={pwOld} onChange={(e) => setPwOld(e.target.value)} />
          <label className="form-label" style={{ marginTop: 12 }}>New Password</label>
          <input className="form-input" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPwModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleChangePassword} disabled={pwLoading}>
            {pwLoading ? <Spinner animation="border" size="sm" /> : "Update Password"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Two-Step Modal */}
      <Modal show={show2StepModal} onHide={() => setShow2StepModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Two-Step Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>This feature is not available currently.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShow2StepModal(false)}>OK</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
