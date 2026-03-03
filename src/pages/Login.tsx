import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiBaseUrl";
import "../styles/Auth.css";

type LoginRole = "admin" | "user" | "pickup_partner";
type LoginMode = "user" | "admin" | "pickup_partner";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("user");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      const backendRole = String(data.user?.role || "").trim().toLowerCase();
      if (backendRole !== "admin" && backendRole !== "user" && backendRole !== "pickup_partner") {
        setMessage("Login response missing valid user role.");
        return;
      }

      if (!data.token) {
        setMessage("Login response missing authentication token.");
        return;
      }

      const tokenToStore = data.token || "";

      const normalizedUser = {
        id: data.user?.id || data.user?._id || "",
        name: data.user?.name || "User",
        email: (data.user?.email || email).trim().toLowerCase(),
        role: backendRole as LoginRole,
        token: tokenToStore,
        rewardPoints: Number(data.user?.rewardPoints || 0),
      };

      // Clear previous auth keys before writing fresh login state.
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");

      // Store both token separately and within user object
      localStorage.setItem("token", tokenToStore);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("userEmail", normalizedUser.email);

      window.dispatchEvent(new Event("auth-changed"));

      const normalizedEmail = normalizedUser.email.trim().toLowerCase();
      const emailIndicatesAdmin = normalizedEmail.includes("admin");
      const shouldGoToPickupPartner = loginMode === "pickup_partner" || normalizedUser.role === "pickup_partner";
      const shouldGoToAdmin =
        loginMode === "admin" || normalizedUser.role === "admin" || emailIndicatesAdmin;

      if (shouldGoToPickupPartner) {
        navigate("/pickup-partner-dashboard");
        return;
      }

      navigate(shouldGoToAdmin ? "/admin-dashboard" : "/home");
    } catch {
      setMessage("Unable to reach server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-subtitle">Welcome back to your eco dashboard</p>
        <h2>
          {loginMode === "admin"
            ? "Login as Admin"
            : loginMode === "pickup_partner"
              ? "Login as Pickup Partner"
              : "Login"}
        </h2>

        <div className="auth-tabs" role="tablist" aria-label="Login type">
          <button
            type="button"
            onClick={() => setLoginMode("user")}
            disabled={isLoading || loginMode === "user"}
            className={`auth-tab ${loginMode === "user" ? "active" : ""}`}
            aria-pressed={loginMode === "user"}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("admin")}
            disabled={isLoading || loginMode === "admin"}
            className={`auth-tab ${loginMode === "admin" ? "active" : ""}`}
            aria-pressed={loginMode === "admin"}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("pickup_partner")}
            disabled={isLoading || loginMode === "pickup_partner"}
            className={`auth-tab ${loginMode === "pickup_partner" ? "active" : ""}`}
            aria-pressed={loginMode === "pickup_partner"}
          >
            Pickup Partner
          </button>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-input-group">
            <span className="auth-input-icon" aria-hidden="true">@</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="auth-input-line" aria-hidden="true" />
          </div>

          <div className="auth-input-group">
            <div className="password-field-shell">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-visual-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            <span className="auth-input-line" aria-hidden="true" />
          </div>

          {message && <p className="auth-message error">{message}</p>}

          <button type="submit" disabled={isLoading} className="auth-submit-btn">
            {isLoading
              ? "Logging in..."
              : loginMode === "admin"
                ? "Login as Admin"
                : loginMode === "pickup_partner"
                  ? "Login as Pickup Partner"
                  : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          No account? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
