import React, { useState } from "react";
import axios from "axios";

function CropYieldPrediction() {
  const [form, setForm] = useState({
    crop: "",
    soil_type: "",
    temperature_c: "",
    rainfall_mm: "",
    fertilizer_kg: "",
    pesticide_ml: "",
    area_acres: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post("http://localhost:5000/api/yield/predict", form);
      setResult(response.data);
    } catch (error) {
      alert("Error: " + error.response?.data?.error);
    }

    setLoading(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container mt-4 flex-grow-1">
        <h2 className="text-center mb-4">🌾 Crop Yield Prediction</h2>

        <form className="card p-4 shadow" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Crop</label>
              <input
                type="text"
                className="form-control"
                name="crop"
                placeholder="e.g., rice, wheat, maize"
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Soil Type</label>
              <input
                type="text"
                className="form-control"
                name="soil_type"
                placeholder="e.g., clay, loam, sandy"
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Temperature (°C)</label>
              <input
                type="number"
                className="form-control"
                name="temperature_c"
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Rainfall (mm)</label>
              <input
                type="number"
                className="form-control"
                name="rainfall_mm"
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Fertilizer Used (kg)</label>
              <input
                type="number"
                className="form-control"
                name="fertilizer_kg"
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Pesticide Used (ml)</label>
              <input
                type="number"
                className="form-control"
                name="pesticide_ml"
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Total Area (acres)</label>
              <input
                type="number"
                className="form-control"
                name="area_acres"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? "Predicting..." : "Predict Yield"}
          </button>
        </form>

        {/* Result Section */}
        {result && (
          <div className="card p-4 shadow mt-4">
            <h4 className="mb-3">📊 Prediction Result</h4>

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Yield per Acre (Quintals)</th>
                  <th>Total Yield (Quintals)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.yield_per_acre_quintals}</td>
                  <td>{result.total_yield_quintals}</td>
                </tr>
              </tbody>
            </table>

            <p className="text-muted mt-2">
              ⚠️ Yield is estimated using your weather, soil, fertilizer & pesticide inputs.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-light text-center py-3 mt-auto border-top">
        © 2025 AgriGenius AI | All Rights Reserved.
      </footer>
    </div>
  );
}

export default CropYieldPrediction;
