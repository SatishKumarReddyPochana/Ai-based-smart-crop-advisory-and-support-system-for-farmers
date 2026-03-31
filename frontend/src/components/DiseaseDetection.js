import React, { useState } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";

export default function DiseasePredictor() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Call API
  const analyzeDisease = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/disease/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data.data);
    } catch (err) {
      setError("Something went wrong! API not reachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="text-success fw-bold mb-4">🌿 Crop Disease Prediction</h3>

      {/* Upload Card */}
      <Card className="p-3 shadow-sm mb-4">
        <h5 className="mb-3">Upload Crop Image</h5>

        <input
          type="file"
          className="form-control mb-3"
          onChange={handleFileChange}
          accept="image/*"
        />

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="img-thumbnail"
            style={{ height: "250px", objectFit: "cover" }}
          />
        )}

        <Button
          className="mt-3"
          variant="success"
          onClick={analyzeDisease}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Analyze Disease"}
        </Button>

        {error && (
          <Alert className="mt-3" variant="danger">
            {error}
          </Alert>
        )}
      </Card>

      {/* Result */}
      {result && (
        <Card className="p-4 shadow-sm border-success mb-5">
          <h4 className="text-success fw-bold">🌱 Diagnosis Report</h4>
          <hr />

          <p>
            <strong>Disease:</strong> {result.disease}
          </p>
          <p>
            <strong>Crop:</strong> {result.crop}
          </p>
          <p>
            <strong>Confidence:</strong>{" "}
            {(result.confidence * 100).toFixed(2)}%
          </p>

          <p>
            <strong>Description:</strong> {result.description}
          </p>

          {/* Lists */}
          <div className="mt-3">
            <h5 className="text-success">Symptoms</h5>
            <ul>
              {result.symptoms.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>

            <h5 className="text-success mt-3">Causes</h5>
            <ul>
              {result.causes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>

            <h5 className="text-success mt-3">Prevention</h5>
            <ul>
              {result.prevention.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>

            <h5 className="text-success mt-3">Treatment</h5>
            <ul>
              {result.treatment.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>

            <h5 className="text-success mt-3">Final Recommendation</h5>
            <p className="border rounded p-3 bg-light">
              {result.recommendation}
            </p>
          </div>
        </Card>
      )}

      <footer className="text-center text-muted mt-4 mb-2">
        © 2025 AgriGenius AI | All Rights Reserved.
      </footer>
    </div>
  );
}
