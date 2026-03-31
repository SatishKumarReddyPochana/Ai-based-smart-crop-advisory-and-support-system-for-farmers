import React, { useState } from "react";
import axios from "axios";

function WeatherAdvisory() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/api/weather/test",
        { params: { city } }
      );
      setWeatherData(response.data);
      setError("");
    } catch (err) {
      setError("⚠️ Failed to fetch weather data. Please check city name or server.");
      setWeatherData(null);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Main Content */}
      <div className="container mt-4 flex-grow-1">
        <div className="card shadow-sm p-4">
          <h4 className="mb-4 ">🌦️ Weather Advisory</h4>

          {/* Input Row */}
          <div className="d-flex mb-3">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Enter city name (e.g., Chennai)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button className="btn btn-success" onClick={fetchWeather}>
              Get Advice
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-danger">{error}</p>}

          {/* Weather Data */}
          {weatherData && !weatherData.error && (
            <div className="mt-3">
              <h5 className="fw-semibold">🌍 City: {city}</h5>
              <p><strong>🌡️ Temperature:</strong> {weatherData.temperature} °C</p>
              <p><strong>💧 Humidity:</strong> {weatherData.humidity} %</p>
              <p><strong>🌧️ Rainfall:</strong> {weatherData.rainfall} mm</p>
              <p><strong>💨 Wind Speed:</strong> {weatherData.wind_speed} m/s</p>
              <p><strong>☁️ Cloud Coverage:</strong> {weatherData.cloud_coverage} %</p>

              <h6 className="mt-4 fw-bold">📌 Farming Advice</h6>
              <ul className="list-group">
                {weatherData.farming_advice.map((advice, index) => (
                  <li
                    key={index}
                    className="list-group-item small"
                  >
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* API Error */}
          {weatherData && weatherData.error && (
            <p className="text-danger">❌ {weatherData.error}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light text-center py-3 mt-auto border-top">
        <small className="text-muted">
          © {new Date().getFullYear()} AgriGenius AI | All Rights Reserved.
        </small>
      </footer>
    </div>
  );
}

export default WeatherAdvisory;



