// src/components/FertilizerAdvisor.js
import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert, ListGroup } from "react-bootstrap";

export default function FertilizerAdvisor() {
  const [form, setForm] = useState({
    crop: "",
    N: "",
    P: "",
    K: "",
  });

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.crop) return "Crop name is required";
    if (form.N === "" || isNaN(form.N)) return "Nitrogen must be a number";
    if (form.P === "" || isNaN(form.P)) return "Phosphorus must be a number";
    if (form.K === "" || isNaN(form.K)) return "Potassium must be a number";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRecommendations([]);

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/api/fertilizer/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: form.crop,
          N: parseFloat(form.N),
          P: parseFloat(form.P),
          K: parseFloat(form.K),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recommendation failed");

      setRecommendations(data.recommendation);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <Card className="p-4 shadow-sm">
        <h4 className="mb-3">Fertilizer Advisor</h4>

        {/* Show errors */}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Crop Name</Form.Label>
                <Form.Control
                  type="text"
                  name="crop"
                  value={form.crop}
                  onChange={handleChange}
                  placeholder="e.g., rice"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nitrogen (N)</Form.Label>
                <Form.Control
                  type="number"
                  name="N"
                  value={form.N}
                  onChange={handleChange}
                  placeholder="e.g., 80"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phosphorus (P)</Form.Label>
                <Form.Control
                  type="number"
                  name="P"
                  value={form.P}
                  onChange={handleChange}
                  placeholder="e.g., 40"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Potassium (K)</Form.Label>
                <Form.Control
                  type="number"
                  name="K"
                  value={form.K}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? "Analyzing..." : "Get Recommendation"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setForm({ crop: "", N: "", P: "", K: "" })}
            >
              Reset
            </Button>
          </div>
        </Form>

        {/* ✅ Show recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-4">
            <Alert variant="success" className="text-center">
              <h5 className="mb-2">✅ Fertilizer Recommendations</h5>
              <ListGroup>
                {recommendations.map((rec, index) => (
                  <ListGroup.Item key={index}>{rec}</ListGroup.Item>
                ))}
              </ListGroup>
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
