import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaLeaf, FaSpinner } from "react-icons/fa";
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
      // ✅ FIXED LINE HERE
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role: loginMode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      const backendRole = String(data.user?.role || "").trim().toLowerCase();
      if (
        backendRole !== "admin" &&
        backendRole !== "user" &&
        backendRole !== "pickup_partner"
      ) {
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

      // Clear old data
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("scrappy_token");
      localStorage.removeItem("scrappy_user");

      // Store new data
      localStorage.setItem("token", tokenToStore);
      localStorage.setItem("scrappy_token", tokenToStore);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("scrappy_user", JSON.stringify(normalizedUser));
      localStorage.setItem("userEmail", normalizedUser.email);

      window.dispatchEvent(new Event("auth-changed"));

      const normalizedEmail = normalizedUser.email.trim().toLowerCase();
      const emailIndicatesAdmin = normalizedEmail.includes("admin");

      const shouldGoToPickupPartner =
        loginMode === "pickup_partner" ||
        normalizedUser.role === "pickup_partner";

      const shouldGoToAdmin =
        loginMode === "admin" ||
        normalizedUser.role === "admin" ||
        emailIndicatesAdmin;

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
        <div className="auth-heading">
          <FaLeaf className="auth-heading-icon" />
          <p className="auth-subtitle">Welcome back to your eco dashboard</p>
          <h2>
            {loginMode === "admin"
              ? "Login as Admin"
              : loginMode === "pickup_partner"
              ? "Login as Pickup Partner"
              : "Login"}
          </h2>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${loginMode === "user" ? "active" : ""}`} onClick={() => setLoginMode("user")} disabled={isLoading}>
            User
          </button>
          <button className={`auth-tab ${loginMode === "admin" ? "active" : ""}`} onClick={() => setLoginMode("admin")} disabled={isLoading}>
            Admin
          </button>
          <button
            className={`auth-tab ${loginMode === "pickup_partner" ? "active" : ""}`}
            onClick={() => setLoginMode("pickup_partner")}
            disabled={isLoading}
          >
            Pickup Partner
          </button>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-input-group">
            <span className="auth-input-icon"><FaEnvelope /></span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="auth-input-line" />
          </div>

          <div className="auth-input-group relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="password-input w-full bg-white pl-10 pr-10 py-3 border border-gray-300 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-green-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="auth-input-icon password-lock-icon absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <FaLock className="h-4 w-4" />
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-visual-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash className="password-eye-icon h-4 w-4" /> : <FaEye className="password-eye-icon h-4 w-4" />}
            </button>
          </div>

          <div className="auth-row">
            <Link to="/forgot-password" className="auth-forgot">Forgot Password?</Link>
          </div>

          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-submit-button" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"><FaSpinner /></span>
            ) : (
              "Login"
            )}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <p className="auth-social-hint">Continue with social account or sign up below</p>

          <p className="auth-switch">
            No account? <Link to="/signup">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
