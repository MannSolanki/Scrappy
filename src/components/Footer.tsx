import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import "../styles/ScrappyUI.css";

const Footer: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true" || Boolean(localStorage.getItem("user"));
      setIsLoggedIn(loggedIn);
    };

    syncAuthState();
    window.addEventListener("auth-changed", syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("auth-changed", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/";
  };

  return (
    <footer className="scrap-footer">
      <div className="scrap-container">
        <div className="footer-grid">
          <div>
            <h3>EcoScrap</h3>
            <p>
              Making the world cleaner through responsible recycling and scrap
              management.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              {isLoggedIn ? (
                <button type="button" className="footer-logout" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </div>
          </div>

          <div>
            <h3>Contact Info</h3>
            <p className="contact-item">
              <Phone size={16} /> 8160219871
            </p>
            <p className="contact-item">
              <Mail size={16} /> support@scrappy.in
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} EcoScrap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
