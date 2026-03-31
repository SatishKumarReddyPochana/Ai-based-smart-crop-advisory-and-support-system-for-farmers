import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Table } from "react-bootstrap";

const API_BASE = "http://localhost:5000/api/irrigation";

export default function IrrigationScheduler() {
  const [seasons, setSeasons] = useState([]);
  const [seasonCrops, setSeasonCrops] = useState({});
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");

  const [form, setForm] = useState({
    soil_moisture: "",
    recent_rainfall: "",
    acres: "",
    location: ""
  });

  const [result, setResult] = useState(null);

  // Fetch dropdown options
  useEffect(() => {
    axios.get(`${API_BASE}/options`)
      .then(res => {
        setSeasons(res.data.seasons);
        setSeasonCrops(res.data.season_crops);
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      season: selectedSeason,
      crop: selectedCrop,
      soil_moisture: Number(form.soil_moisture),
      recent_rainfall: Number(form.recent_rainfall),
      acres: Number(form.acres),
      location: form.location
    };

    try {
      const response = await axios.post(`${API_BASE}/schedule`, payload);
      setResult(response.data.data);
    } catch (error) {
      console.error(error);
      alert("Error calculating irrigation");
    }
  };

  // ✔ farmer-friendly labels mapping
  const labelMapping = {
    crop: "Crop",
    cwr_mm_per_day: "Water Needed Per Day (mm)",
    days_to_harvest: "Days to Harvest",
    effective_mm_per_day: "Actual Water Needed After Rain (mm)",
    et0_mm_per_day: "Weather Water Loss (mm)",
    frequency: "Irrigation Schedule",
    humidity_pct: "Humidity (%)",
    kc: "Crop Water Factor",
    litres_per_acre_per_day: "Water per Acre Per Day (Litres)",
    recent_rainfall_mm: "Recent Rainfall (mm)",
    season: "Season",
    soil_moisture_pct: "Soil Moisture (%)",
    temperature_c: "Temperature (°C)",
    total_litres_per_day: "Total Water Needed Per Day (Litres)"
  };

  return (
    <Container fluid className="mt-4">

      <Row>
        {/* Left: Form */}
        <Col md={5}>
          <Card className="p-3 shadow">
            <h4 className="mb-3">🌾 Irrigation Scheduler</h4>

            <Form onSubmit={handleSubmit}>
              
              {/* Season */}
              <Form.Group className="mb-3">
                <Form.Label>Select Season</Form.Label>
                <Form.Select
                  value={selectedSeason}
                  onChange={(e) => { setSelectedSeason(e.target.value); setSelectedCrop(""); }}
                  required
                >
                  <option value="">-- select season --</option>
                  {seasons.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Crop */}
              <Form.Group className="mb-3">
                <Form.Label>Select Crop</Form.Label>
                <Form.Select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  required
                  disabled={!selectedSeason}
                >
                  <option value="">-- select crop --</option>
                  {selectedSeason &&
                    seasonCrops[selectedSeason]?.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                </Form.Select>
              </Form.Group>

              {/* Soil Moisture */}
              <Form.Group className="mb-3">
                <Form.Label>Soil Moisture (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="soil_moisture"
                  placeholder="e.g., 30"
                  value={form.soil_moisture}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Rainfall */}
              <Form.Group className="mb-3">
                <Form.Label>Recent Rainfall (mm)</Form.Label>
                <Form.Control
                  type="number"
                  name="recent_rainfall"
                  placeholder="e.g., 5"
                  value={form.recent_rainfall}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Acres */}
              <Form.Group className="mb-3">
                <Form.Label>Acres</Form.Label>
                <Form.Control
                  type="number"
                  name="acres"
                  placeholder="e.g., 10"
                  value={form.acres}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Location */}
              <Form.Group className="mb-3">
                <Form.Label>Location (City)</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  placeholder="e.g., Hyderabad"
                  value={form.location}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button type="submit" className="w-100 btn-success mt-2">
                Generate Irrigation Plan
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Right: Results */}
        <Col md={7}>
          {result && (
            <Card className="p-3 shadow">
              <h4 className="mb-3 text-primary">📘 Irrigation Summary</h4>

              <Table striped bordered hover>
                <tbody>
                  {Object.entries(result).map(([key, value]) => {
                    const label = labelMapping[key] || key;

                    // Frequency readable format
                    if (key === "frequency" && typeof value === "object") {
                      return (
                        <tr key={key}>
                          <td style={{ fontWeight: "600" }}>{label}</td>
                          <td>
                            {value.times_per_day} times/day ({value.times_per_week}/week)
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={key}>
                        <td style={{ fontWeight: "600" }}>{label}</td>
                        <td>{value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          )}
        </Col>
      </Row>

      {/* Footer */}
      <Row className="mt-4">
        <Col className="text-center text-muted">
          <p>© 2025 AgriGenius AI | All Rights Reserved.</p>
        </Col>
      </Row>

    </Container>
  );
}

