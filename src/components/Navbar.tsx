import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Recycle, X } from "lucide-react";
import { motion } from "framer-motion";
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

  const navItemClass = (path: string) =>
    `nav-link${location.pathname === path ? " nav-link-active" : ""}`;

  return (
    <motion.nav
      className="scrap-navbar"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scrap-navbar-inner">
        <div className="nav-head">
          <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.4 }}>
            <Link to={homeRoute} className="brand">
              <Recycle size={24} />
              <span>EcoScrap</span>
            </Link>
          </motion.div>
          <motion.button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.4 }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <div className="nav-links-list">
            {isAdmin && (
              <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.4 }}>
                <Link to="/admin-dashboard" className={navItemClass("/admin-dashboard")}>
                  Admin Dashboard
                </Link>
              </motion.div>
            )}
            {isPickupPartner && (
              <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.4 }}>
                <Link to="/pickup-partner-dashboard" className={navItemClass("/pickup-partner-dashboard")}>
                  Pickup Dashboard
                </Link>
              </motion.div>
            )}
            {!isAdmin && !isPickupPartner && (
              <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.4 }}>
                <Link to="/home" className={navItemClass("/home")}>
                  Home
                </Link>
              </motion.div>
            )}
            <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.4 }}>
              <Link to="/about" className={navItemClass("/about")}>
                About
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.4 }}>
              <Link to="/contact" className={navItemClass("/contact")}>
                Contact
              </Link>
            </motion.div>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.4 }}>
            <Link to={user ? homeRoute : "/login"} className="login-btn">
              {isAdmin ? "Hi Admin" : isPickupPartner ? "Pickup Partner" : user?.name ? `Hi ${user.name}` : "Login"}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
