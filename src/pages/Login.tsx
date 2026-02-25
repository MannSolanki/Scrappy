import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const API_BASE_URL = "http://localhost:5000";

type LoginRole = "admin" | "user" | "pickup_partner";
type LoginMode = "user" | "admin" | "pickup_partner";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
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
        <h2>
          {loginMode === "admin"
            ? "Login as Admin"
            : loginMode === "pickup_partner"
              ? "Login as Pickup Partner"
              : "Login"}
        </h2>

        <div className="auth-switch" style={{ marginBottom: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setLoginMode("user")}
            disabled={isLoading || loginMode === "user"}
            className="link-button"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              marginRight: "0.75rem",
              color: loginMode === "user" ? "var(--brand-accent, #16a34a)" : "inherit",
              cursor: isLoading || loginMode === "user" ? "default" : "pointer",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            Login as User
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("admin")}
            disabled={isLoading || loginMode === "admin"}
            className="link-button"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: loginMode === "admin" ? "var(--brand-accent, #16a34a)" : "inherit",
              cursor: isLoading || loginMode === "admin" ? "default" : "pointer",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            Login as Admin
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("pickup_partner")}
            disabled={isLoading || loginMode === "pickup_partner"}
            className="link-button"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              marginLeft: "0.75rem",
              color: loginMode === "pickup_partner" ? "var(--brand-accent, #16a34a)" : "inherit",
              cursor: isLoading || loginMode === "pickup_partner" ? "default" : "pointer",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            Login as Pickup Partner
          </button>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {message && <p className="auth-message error">{message}</p>}

          <button type="submit" disabled={isLoading}>
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
          No account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
