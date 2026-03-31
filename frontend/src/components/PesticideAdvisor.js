// src/components/PesticideAdvisor.js
import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";

export default function PesticideAdvisor() {
  const [form, setForm] = useState({
    crop: "",
    pest_type: "",
    symptom: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [crops, setCrops] = useState([]);
  const [pestTypes, setPestTypes] = useState([]);
  const [symptoms, setSymptoms] = useState([]);

  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState("");

  // 🔥 Fetch valid options at mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/pesticide/options");
        const data = await res.json();

        setCrops(data.valid_crops || []);
        setPestTypes(data.valid_pest_types || []);
        setSymptoms(data.valid_symptoms || []);
      } catch (err) {
        setError("Failed to load crop/symptom options.");
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRecommendation("");

    if (!form.crop || !form.pest_type || !form.symptom) {
      setError("Please select all fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "http://127.0.0.1:5000/api/pesticide/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Prediction failed.");

      setRecommendation(data.recommended_pesticide);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <Card className="p-4 shadow-sm">
        <h4 className="mb-3">Pesticide Advisor</h4>

        {/* Error */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Loading crops/symptoms */}
        {loadingOptions ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading options...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Crop</Form.Label>
                  <Form.Select
                    name="crop"
                    value={form.crop}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Crop --</option>
                    {crops.map((c, index) => (
                      <option key={index} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Pest Type</Form.Label>
                  <Form.Select
                    name="pest_type"
                    value={form.pest_type}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Pest --</option>
                    {pestTypes.map((p, index) => (
                      <option key={index} value={p}>
                        {p}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Symptom</Form.Label>
                  <Form.Select
                    name="symptom"
                    value={form.symptom}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Symptom --</option>
                    {symptoms.map((s, index) => (
                      <option key={index} value={s}>
                        {s}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button type="submit" variant="success" disabled={loading}>
                {loading ? "Analyzing..." : "Get Recommendation"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setForm({ crop: "", pest_type: "", symptom: "" });
                  setRecommendation("");
                  setError("");
                }}
              >
                Reset
              </Button>
            </div>
          </Form>
        )}

        {/* Prediction result */}
        {recommendation && (
          <Alert variant="success" className="mt-4 text-center">
            <h5>🌱 Recommended Pesticide</h5>
            <p className="mb-0">{recommendation}</p>
          </Alert>
        )}
      </Card>

      <footer className="text-center mt-4 p-3 bg-light border-top">
        <small>
          © {new Date().getFullYear()} AgriGenius AI | All Rights Reserved.
        </small>
      </footer>
    </div>
  );
}
