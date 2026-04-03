import React, { useState } from "react";
import { FaEnvelope, FaLock, FaLeaf, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";

// ✅ IMPORTANT: Your backend base URL
const API_BASE_URL = "http://localhost:5000/api";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setMessage("✅ Signup successful!");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (error: any) {
      console.error("Signup error:", error);
      setMessage("❌ Unable to reach server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <FaLeaf className="auth-heading-icon" />
          <h2>Signup</h2>
          <p className="auth-subtitle">Create a new eco-friendly account</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="auth-input-group">
            <span className="auth-input-icon"><FaEnvelope /></span>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="auth-input-line" />
          </div>

          <div className="auth-input-group">
            <span className="auth-input-icon"><FaLock /></span>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="auth-input-line" />
          </div>

          <div className="auth-role-select">
            <button type="button" className={`auth-tab ${role === "user" ? "active" : ""}`} onClick={() => setRole("user")}>User</button>
            <button type="button" className={`auth-tab ${role === "pickup_partner" ? "active" : ""}`} onClick={() => setRole("pickup_partner")}>Pickup Partner</button>
          </div>

          {message && (
            <p className="auth-message">{message}</p>
          )}

          <button type="submit" className="auth-submit-button" disabled={isLoading}>
            {isLoading ? <span className="spinner"><FaSpinner /></span> : "Signup"}
          </button>

          <div className="auth-divider"><span>OR</span></div>
          <p className="auth-social-hint">Already registered? <Link to="/login">Login here</Link></p>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Go to login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;