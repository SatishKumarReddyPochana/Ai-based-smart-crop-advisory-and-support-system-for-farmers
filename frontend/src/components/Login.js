// src/components/Login.js
import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token); // save token
      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 auth-page">
      <Card className="p-4 shadow-lg rounded-4 auth-card">
        <div className="text-center mb-3">
          <img src={logo} alt="AgriGenius AI" width="80" />
          <h3 className="mt-2">AgriGenius AI</h3>
          <p className="text-muted">Smart Farming Decision Support System</p>
        </div>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {error && <p className="text-danger">{error}</p>}

          <Button type="submit" variant="success" className="w-100">
            Login
          </Button>
        </Form>

        <div className="text-center mt-3">
          <small>
            Don’t have an account? <a href="/signup">Sign up</a>
          </small>
        </div>
      </Card>
    </div>
  );
}

export default Login;
