import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import "../styles/ScrappyUI.css";

const Footer: React.FC = () => {
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
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/login">Login</Link>
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
