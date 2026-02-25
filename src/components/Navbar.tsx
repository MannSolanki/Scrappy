import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Recycle, Sun } from "lucide-react";
import "../styles/ScrappyUI.css";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  token?: string;
};

const Navbar: React.FC = () => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const normalizedRole = String(user?.role || "").trim().toLowerCase();
  const isAdmin = normalizedRole === "admin";
  const isPickupPartner = normalizedRole === "pickup_partner";
  const homeRoute = isAdmin ? "/admin-dashboard" : isPickupPartner ? "/pickup-partner-dashboard" : "/home";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const syncUserFromStorage = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const savedUser = localStorage.getItem("user");

      if (!isLoggedIn || !savedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    };

    syncUserFromStorage();
    window.addEventListener("auth-changed", syncUserFromStorage);
    window.addEventListener("storage", syncUserFromStorage);

    return () => {
      window.removeEventListener("auth-changed", syncUserFromStorage);
      window.removeEventListener("storage", syncUserFromStorage);
    };
  }, []);

  return (
    <nav className="scrap-navbar">
      <div className="scrap-container scrap-navbar-inner">
        <Link to={homeRoute} className="brand">
          <Recycle size={28} />
          <span>EcoScrap</span>
        </Link>

        <div className="nav-links">
          {isAdmin && (
            <Link to="/admin-dashboard" className="nav-link">
              Admin Dashboard
            </Link>
          )}
          {isPickupPartner && (
            <Link to="/pickup-partner-dashboard" className="nav-link">
              Pickup Dashboard
            </Link>
          )}
          {!isAdmin && !isPickupPartner && (
            <Link to="/home" className="nav-link">
              Home
            </Link>
          )}
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setTheme((previous) => (previous === "light" ? "dark" : "light"))}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <Link to={user ? homeRoute : "/login"} className="login-btn">
            {isAdmin ? "Hi Admin" : isPickupPartner ? "Pickup Partner" : user?.name ? `Hi ${user.name}` : "Login"}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
