<<<<<<< HEAD
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Recycle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🌿');
      // Navigate after login — AuthContext will redirect correctly
      navigate(from || '/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Please try again.');
=======
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
>>>>>>> scrappy
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-200">
              <Recycle className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your Scrappy account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input type="checkbox" className="w-4 h-4 accent-green-600 rounded" /> Remember me
              </label>
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 text-center text-xs text-gray-400">
          🌱 Join 2000+ eco-conscious users on Scrappy
        </div>
=======
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
>>>>>>> scrappy
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Login;
=======
export default Login;
>>>>>>> scrappy
