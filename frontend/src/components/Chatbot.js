import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { Send } from "lucide-react";

export default function FarmerChat() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick reply options for realistic chatbot
  const quickReplies = [
    "Best fertilizer for paddy?",
    "How to increase crop yield?",
    "Pesticide for cotton pests?",
    "Today weather advice?",
  ];

  const sendMessage = async (customMessage = null) => {
    const finalMessage = customMessage || userInput;

    if (!finalMessage.trim()) return;

    // Add user message to UI
    const newMessage = { sender: "user", text: finalMessage };
    setMessages((prev) => [...prev, newMessage]);

    if (!customMessage) setUserInput("");

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:5000/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalMessage }),
      });

      const data = await res.json();

      const aiMsg = {
        sender: "bot",
        text: data.reply || "No reply generated.",
        tips: data.tips || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to chatbot API." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => e.key === "Enter" && sendMessage();

  return (
    <div
      className="p-3"
      style={{
        background: "#e9f7ec",
        minHeight: "100vh",
      }}
    >
      <Card
        className="p-3 shadow-lg rounded-4 mx-auto"
        style={{
          width: "80%",
          height: "80vh",
          border: "2px solid #4caf50",
          background: "#ffffff",
        }}
      >
        {/* Header */}
        <div
          className="p-3 mb-3 rounded-3 text-white"
          style={{
            background: "linear-gradient(90deg, #4caf50, #2e7d32)",
          }}
        >
          <h4 className="mb-0">🌿 AgriGenius Farmer Chat Assistant</h4>
        </div>

        {/* Chat Area */}
        <div
          className="p-3 mb-3"
          style={{
            height: "60vh",
            overflowY: "auto",
            borderRadius: "8px",
            background: "#f6fff7",
            border: "1px solid #c8e6c9",
          }}
        >
          {messages.map((msg, index) => (
            <div key={index} className="mb-3">
              {/* Message bubble */}
              <div
                className={`p-2 rounded-3 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-success text-white ms-auto"
                    : "bg-light text-dark"
                }`}
                style={{
                  maxWidth: "70%",
                  textAlign: msg.sender === "user" ? "right" : "left",
                }}
              >
                {msg.text}

                {/* Bot tips */}
                {msg.sender === "bot" &&
                  msg.tips &&
                  msg.tips.length > 0 && (
                    <ul className="mt-2">
                      {msg.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  )}
              </div>

              {/* Quick reply buttons for bot messages */}
              {msg.sender === "bot" && (
                <div className="mt-2 d-flex gap-2 flex-wrap">
                  {quickReplies.map((qr, i) => (
                    <Button
                      key={i}
                      variant="outline-success"
                      size="sm"
                      onClick={() => sendMessage(qr)}
                      className="rounded-pill"
                    >
                      {qr}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="text-success fst-italic">🌱 AgriGenius is typing...</div>
          )}
        </div>

        {/* Input Field */}
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Ask something about crops, weather, pests..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKey}
            className="rounded-pill"
            style={{ borderColor: "#4caf50" }}
          />

          <Button
            variant="success"
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "50px", height: "50px" }}
            onClick={() => sendMessage()}
          >
            {loading ? <Spinner size="sm" /> : <Send size={20} />}
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <footer className="text-center mt-3 text-muted">
        <small>© {new Date().getFullYear()} AgriGenius AI |  All Rights Reserved.</small>
      </footer>
    </div>
  );
}

