// src/components/LandProfile.js
import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col, Table } from "react-bootstrap";

// Helper: extract user_id from JWT without extra libs
function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id || payload.id || payload.sub || "";
  } catch (e) {
    return "";
  }
}

export default function LandProfile() {
  const [form, setForm] = useState({
    user_id: "",
    soil_type: "",
    ph: "",
    rainfall: "",
    temperature: "",
    location: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [profiles, setProfiles] = useState([]); // profiles from backend
  const [editId, setEditId] = useState(null); // track profile id for editing

  // Load profiles from backend
  const fetchProfiles = async (uid) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/land/user/${uid}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch profiles");
      setProfiles(data);
    } catch (err) {
      setMsg({ type: "danger", text: err.message });
    }
  };

  // On mount → set user_id and fetch profiles
  useEffect(() => {
    const uid = getUserIdFromToken();
    if (uid) {
      setForm((f) => ({ ...f, user_id: uid }));
      fetchProfiles(uid);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.user_id) return "user_id is required";
    if (!form.soil_type.trim()) return "soil_type is required";
    if (form.ph === "" || isNaN(form.ph)) return "ph must be a number";
    const ph = parseFloat(form.ph);
    if (ph < 0 || ph > 14) return "ph must be between 0 and 14";
    if (form.rainfall === "" || isNaN(form.rainfall))
      return "rainfall must be a number";
    if (form.temperature === "" || isNaN(form.temperature))
      return "temperature must be a number";
    if (!form.location.trim()) return "location is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const err = validate();
    if (err) {
      setMsg({ type: "danger", text: err });
      return;
    }

    const payload = {
      user_id: Number(form.user_id),
      soil_type: form.soil_type.trim(),
      ph: parseFloat(form.ph),
      rainfall: parseFloat(form.rainfall),
      temperature: parseFloat(form.temperature),
      location: form.location.trim(),
    };

    try {
      setSubmitting(true);
      let res, data;

      if (editId) {
        // update existing profile
        res = await fetch(`http://127.0.0.1:5000/api/land/update/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // add new profile
        res = await fetch("http://127.0.0.1:5000/api/land/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);

      setMsg({ type: "success", text: data.message || "Saved successfully!" });
      fetchProfiles(form.user_id);

      setForm((f) => ({
        ...f,
        soil_type: "",
        ph: "",
        rainfall: "",
        temperature: "",
        location: "",
      }));
      setEditId(null);
    } catch (error) {
      setMsg({ type: "danger", text: error.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (profile) => {
    setForm(profile);
    setEditId(profile.id);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/land/delete/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      setMsg({ type: "success", text: data.message });
      fetchProfiles(form.user_id);
    } catch (error) {
      setMsg({ type: "danger", text: error.message });
    }
  };

  return (
    <div className="p-3">
      <Card className="p-4 shadow-sm">
        <h4 className="mb-3">
          {editId ? "Edit Land Profile" : "Add Land Profile"}
        </h4>
        {msg.text && (
          <div className={`alert alert-${msg.type} py-2`} role="alert">
            {msg.text}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="number"
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                  placeholder="e.g., 1"
                  required
                  disabled
                />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Village / Mandal / District"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Soil Type</Form.Label>
                <Form.Select
                  name="soil_type"
                  value={form.soil_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select soil type --</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Black">Black</option>
                  <option value="Red">Red</option>
                  <option value="Laterite">Laterite</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>pH</Form.Label>
                <Form.Control
                  type="number"
                  name="ph"
                  step="0.1"
                  min="0"
                  max="14"
                  value={form.ph}
                  onChange={handleChange}
                  placeholder="e.g., 6.5"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Rainfall (mm)</Form.Label>
                <Form.Control
                  type="number"
                  name="rainfall"
                  step="1"
                  value={form.rainfall}
                  onChange={handleChange}
                  placeholder="e.g., 120"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Temperature (°C)</Form.Label>
                <Form.Control
                  type="number"
                  name="temperature"
                  step="0.1"
                  value={form.temperature}
                  onChange={handleChange}
                  placeholder="e.g., 28.5"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" variant="success" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editId
                ? "Update Land Profile"
                : "Save Land Profile"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setForm({
                  user_id: form.user_id,
                  soil_type: "",
                  ph: "",
                  rainfall: "",
                  temperature: "",
                  location: "",
                })
              }
            >
              Reset
            </Button>
          </div>
        </Form>
      </Card>

      {/* Table Section */}
      {profiles.length > 0 && (
        <Card className="p-3 shadow-sm mt-4">
          <h5>Saved Land Profiles</h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>Soil Type</th>
                <th>pH</th>
                <th>Rainfall</th>
                <th>Temperature</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.location}</td>
                  <td>{p.soil_type}</td>
                  <td>{p.ph}</td>
                  <td>{p.rainfall}</td>
                  <td>{p.temperature}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleEdit(p)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Footer */}
      <footer className="text-center mt-4 p-3 bg-light border-top">
        <small>
          © {new Date().getFullYear()} AgriGenius AI | All Rights Reserved.
        </small>
      </footer>
    </div>
  );
}




