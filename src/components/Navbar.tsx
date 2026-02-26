import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Recycle, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const normalizedRole = String(user?.role || "").trim().toLowerCase();
  const isAdmin = normalizedRole === "admin";
  const isPickupPartner = normalizedRole === "pickup_partner";
  const homeRoute = isAdmin ? "/admin-dashboard" : isPickupPartner ? "/pickup-partner-dashboard" : "/home";

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

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="scrap-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scrap-navbar-inner">
        <div className="nav-head">
          <Link to={homeRoute} className="brand">
            <Recycle size={24} />
            <span>EcoScrap</span>
          </Link>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <div className="nav-links-list">
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
          </div>
          <Link to={user ? homeRoute : "/login"} className="login-btn">
            {isAdmin ? "Hi Admin" : isPickupPartner ? "Pickup Partner" : user?.name ? `Hi ${user.name}` : "Login"}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
