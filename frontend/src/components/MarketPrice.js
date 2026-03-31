import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import Chart from "chart.js/auto";

export default function MarketPrice() {
  const [form, setForm] = useState({
    crop: "",
    market: "",
    quantity_kg: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // For Chart instance
  let chartRef = null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.crop) return "Crop name is required";
    if (!form.market) return "Market name is required";
    if (form.quantity_kg === "" || isNaN(form.quantity_kg))
      return "Quantity must be a valid number";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:5000/api/predict_market_price/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: form.crop,
          market: form.market,
          quantity_kg: parseFloat(form.quantity_kg),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Prediction failed");

      setResult(data);

      // Draw Graph
      setTimeout(() => renderGraph(data.trend), 200);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const renderGraph = (values) => {
    if (!values || values.length === 0) return;

    const ctx = document.getElementById("trendChart");

    if (chartRef) chartRef.destroy();

    chartRef = new Chart(ctx, {
      type: "line",
      data: {
        labels: values.map((_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: "Price Trend (₹ per kg)",
            data: values,
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      },
    });
  };

  return (
    <div className="p-3">
      <Card className="p-4 shadow-sm">
        <h4 className="mb-3">Market Price Predictor</h4>

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
                <Form.Label>Market</Form.Label>
                <Form.Control
                  type="text"
                  name="market"
                  value={form.market}
                  onChange={handleChange}
                  placeholder="e.g., Kadapa"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Quantity (kg)</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity_kg"
                  value={form.quantity_kg}
                  onChange={handleChange}
                  placeholder="e.g., 25"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? "Predicting..." : "Predict Price"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setForm({ crop: "", market: "", quantity_kg: "" })
              }
            >
              Reset
            </Button>
          </div>
        </Form>

        {/* RESULTS */}
        {result && (
          <div className="mt-4">
            <Alert variant="success">
              <h5 className="mb-3">📌 Prediction Result</h5>

              <p>
                <strong>Price per kg: </strong>₹{result.price_per_kg}
              </p>

              <p>
                <strong>Total Price: </strong>₹{result.total_price}
              </p>

              <p>
                <strong>Comment: </strong> {result.comment}
              </p>
            </Alert>

            <h5 className="mt-4">📈 7-Day Price Trend</h5>
            <canvas id="trendChart" height="80"></canvas>
          </div>
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
