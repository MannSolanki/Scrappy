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

type NavVariant = "default" | "primary" | "profile";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const normalizedRole = String(user?.role || "").trim().toLowerCase();
  const isAdmin = normalizedRole === "admin";
  const isPickupPartner = normalizedRole === "pickup_partner";
  const isPickupAgent = normalizedRole === "pickup_agent";
  const isPublicNav = !isAdmin && !isPickupPartner && !isPickupAgent;
  const isSignedInCustomer = Boolean(user) && isPublicNav;
  const homeRoute = isAdmin ? "/admin-dashboard" : isPickupPartner ? "/pickup-partner-dashboard" : isPickupAgent ? "/agent-dashboard" : "/home";

  const getUserDisplayName = () => {
    if (!user?.name) return "Profile";
    const firstName = user.name.split(" ")[0];
    return firstName.length > 12 ? firstName.substring(0, 12) : firstName;
  };

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
  }, [location.pathname, location.hash]);

  const navItemClass = (active: boolean, variant: NavVariant = "default") =>
    `nav-link${active ? " nav-link-active" : ""}${variant === "primary" ? " nav-link-primary" : ""}${variant === "profile" ? " nav-link-profile" : ""}`;

  const matchesRoute = (pathname: string, hash = "") => location.pathname === pathname && location.hash === hash;

  const customerNavItems = [
    {
      label: "Home",
      to: "/home",
      active: location.pathname === "/home" && location.hash !== "#scrap-price-cards",
      variant: "default" as NavVariant,
    },
    {
      label: "Book Pickup",
      to: isSignedInCustomer ? "/dashboard#book-pickup" : "/login",
      active:
        location.pathname === "/dashboard" &&
        location.hash !== "#track-request" &&
        location.hash !== "#profile-overview",
      variant: "primary" as NavVariant,
    },
    {
      label: "Track Request",
      to: isSignedInCustomer ? "/dashboard#track-request" : "/login",
      active: matchesRoute("/dashboard", "#track-request"),
      variant: "default" as NavVariant,
    },
    {
      label: "Scrap History",
      to: isSignedInCustomer ? "/history" : "/login",
      active: location.pathname === "/history",
      variant: "default" as NavVariant,
    },
    {
      label: "Pricing",
      to: "/home#scrap-price-cards",
      active: matchesRoute("/home", "#scrap-price-cards"),
      variant: "default" as NavVariant,
    },
    {
      label: "Contact",
      to: "/contact",
      active: location.pathname === "/contact",
      variant: "default" as NavVariant,
    },
  ];

  return (
    <motion.nav
      className={`scrap-navbar ${menuOpen ? "menu-open" : ""}`}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="scrap-navbar-inner">
        <div className="nav-head">
          <Link to={homeRoute} className="brand">
            <Recycle size={22} />
            <span>EcoScrap</span>
          </Link>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <Menu size={20} />
          </button>
        </div>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <div className="nav-links-content">
            <div className="dropdown-head">
              <span className="dropdown-title">Menu</span>
              <button
                type="button"
                className="mobile-menu-close-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="nav-right-group">
              <div className="nav-links-list">
                {isPublicNav && (
                  <>
                    {customerNavItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={navItemClass(item.active, item.variant)}
                        aria-current={item.active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    ))}

                    {user ? (
                      <Link
                        to="/dashboard#profile-overview"
                        className={navItemClass(matchesRoute("/dashboard", "#profile-overview"), "profile")}
                        aria-current={matchesRoute("/dashboard", "#profile-overview") ? "page" : undefined}
                      >
                        {getUserDisplayName()}
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className={navItemClass(location.pathname === "/login" || location.pathname === "/signup", "profile")}
                        aria-current={location.pathname === "/login" || location.pathname === "/signup" ? "page" : undefined}
                      >
                        Login / Signup
                      </Link>
                    )}
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link to="/admin-dashboard" className={navItemClass(location.pathname === "/admin-dashboard")}>
                      Admin Dashboard
                    </Link>
                    <Link to="/contact" className={navItemClass(location.pathname === "/contact")}>
                      Contact
                    </Link>
                  </>
                )}

                {isPickupPartner && (
                  <>
                    <Link to="/pickup-partner-dashboard" className={navItemClass(location.pathname === "/pickup-partner-dashboard")}>
                      Pickup Dashboard
                    </Link>
                    <Link to="/contact" className={navItemClass(location.pathname === "/contact")}>
                      Contact
                    </Link>
                  </>
                )}

                {isPickupAgent && (
                  <>
                    <Link to="/agent-dashboard" className={navItemClass(location.pathname === "/agent-dashboard")}>
                      Agent Dashboard
                    </Link>
                    <Link to="/contact" className={navItemClass(location.pathname === "/contact")}>
                      Contact
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
