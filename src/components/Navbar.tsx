<<<<<<< HEAD
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  const dashboardPath = user?.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 rounded-lg group-hover:shadow-lg group-hover:shadow-green-200 transition-all duration-300">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              Scrappy
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-green-700" />
                  </div>
                  <span className="font-medium text-gray-800">{user?.name?.split(' ')[0]}</span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full capitalize font-medium">
                    {user?.role}
                  </span>
                </div>
                <Link to={dashboardPath} className="btn-outline-sm">
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-danger-sm">
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline-sm">Login</Link>
                <Link to="/signup" className="btn-primary-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2 animate-fade-in">
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="flex items-center px-4 py-2 text-green-700 font-medium hover:bg-green-50 rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2 text-center border border-green-600 text-green-600 rounded-lg font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/signup" className="block px-4 py-2 text-center bg-green-600 text-white rounded-lg font-medium" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
=======
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
>>>>>>> scrappy
      </div>
    </nav>
  );
};

<<<<<<< HEAD
export default Navbar;
=======
export default Navbar;
>>>>>>> scrappy
