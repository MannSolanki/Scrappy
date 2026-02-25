<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Mail, Phone, MapPin, Github, Linkedin, Twitter, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 rounded-lg">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Scrappy</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              India's eco-friendly scrap marketplace. Turn waste into wealth while protecting our planet.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/buyer/dashboard', label: 'Browse Scrap' },
                { to: '/signup?role=seller', label: 'Sell Scrap' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-green-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {['Metal', 'E-Waste', 'Plastic', 'Paper', 'Glass', 'Rubber'].map(cat => (
                <li key={cat}>
                  <Link to={`/buyer/dashboard?category=${cat}`} className="hover:text-green-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <a href="tel:+918160219871" className="flex items-center gap-2 hover:text-green-400 transition-colors">
                <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                +91 81602 19871
              </a>
              <a href="mailto:info@scrappy.in" className="flex items-center gap-2 hover:text-green-400 transition-colors">
                <Mail className="h-4 w-4 text-green-500 flex-shrink-0" />
                info@scrappy.in
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                Surat, Gujarat, India 395006
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Scrappy. Made with <Heart className="h-4 w-4 inline text-red-400" /> for a greener India.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
          </div>
=======
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
>>>>>>> scrappy
        </div>
      </div>
    </footer>
  );
};

<<<<<<< HEAD
export default Footer;
=======
export default Footer;
>>>>>>> scrappy
