// src/components/CropRecommendation.js
import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";

export default function CropRecommendation() {
  const [form, setForm] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    for (const key in form) {
      if (form[key] === "" || isNaN(form[key])) {
        return `${key} must be a valid number`;
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/api/predict/crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nitrogen: parseFloat(form.nitrogen),
          phosphorus: parseFloat(form.phosphorus),
          potassium: parseFloat(form.potassium),
          temperature: parseFloat(form.temperature),
          humidity: parseFloat(form.humidity),
          ph: parseFloat(form.ph),
          rainfall: parseFloat(form.rainfall),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");

      setResult(data.recommended_crop);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <Card className="p-4 shadow-sm">
        <h4 className="mb-3">Crop Recommendation</h4>

        {/* Show errors at the top */}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nitrogen</Form.Label>
                <Form.Control
                  type="number"
                  name="nitrogen"
                  value={form.nitrogen}
                  onChange={handleChange}
                  placeholder="e.g., 90"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Phosphorus</Form.Label>
                <Form.Control
                  type="number"
                  name="phosphorus"
                  value={form.phosphorus}
                  onChange={handleChange}
                  placeholder="e.g., 40"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Potassium</Form.Label>
                <Form.Control
                  type="number"
                  name="potassium"
                  value={form.potassium}
                  onChange={handleChange}
                  placeholder="e.g., 40"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Temperature (°C)</Form.Label>
                <Form.Control
                  type="number"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  placeholder="e.g., 25"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Humidity (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="humidity"
                  value={form.humidity}
                  onChange={handleChange}
                  placeholder="e.g., 80"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>pH</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  name="ph"
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
                  value={form.rainfall}
                  onChange={handleChange}
                  placeholder="e.g., 200"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? "Predicting..." : "Get Recommendation"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setForm({
                  nitrogen: "",
                  phosphorus: "",
                  potassium: "",
                  temperature: "",
                  humidity: "",
                  ph: "",
                  rainfall: "",
                })
              }
            >
              Reset
            </Button>
          </div>
        </Form>

        {/* ✅ Show recommendation at bottom */}
        {result && (
          <div className="mt-4">
            <Alert variant="success" className="text-center">
              <h5 className="mb-1">✅ Recommended Crop</h5>
              <h4 className="fw-bold">{result}</h4>
            </Alert>
          </div>
        )}
      </Card>

      {/* ✅ Footer */}
      <footer className="text-center mt-4 p-3 bg-light border-top">
        <small>
          © {new Date().getFullYear()} AgriGenius AI | All Rights Reserved.
        </small>
      </footer>
    </div>
  );
}

