import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/apiBaseUrl";
import "../styles/Dashboard.css";
import { CalendarClock, MapPin, Recycle, Truck, Wallet, Weight } from "lucide-react";

type ScrapType = "plastic" | "metal" | "paper" | "e-waste";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  token?: string;
  rewardPoints?: number;
};

type ScrapRequest = {
  _id: string;
  scrapType: ScrapType;
  estimatedWeightKg: number;
  address: string;
  preferredPickupDateTime: string;
  ratePerKg: number;
  estimatedPrice: number;
  rewardPoints: number;
  status: "pending" | "approved" | "on_the_way" | "rejected" | "completed";
  createdAt: string;
};

const RATE_CARD: Record<ScrapType, number> = {
  plastic: 10,
  metal: 25,
  paper: 8,
  "e-waste": 15,
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [requests, setRequests] = useState<ScrapRequest[]>([]);
  const [totalRewards, setTotalRewards] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    scrapType: "plastic" as ScrapType,
    estimatedWeightKg: "",
    address: "",
    preferredPickupDateTime: "",
  });

  const estimatedPrice = useMemo(() => {
    const weight = Number(formData.estimatedWeightKg);
    if (!Number.isFinite(weight) || weight <= 0) {
      return 0;
    }
    return weight * RATE_CARD[formData.scrapType];
  }, [formData.estimatedWeightKg, formData.scrapType]);

  const authHeaders = useMemo(() => {
    const token = user?.token || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  const loadRequests = async (headers: Record<string, string>) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/scrap-requests/my-requests`, {
        method: "GET",
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.message || "Failed to load pickup history");
        return;
      }

      setRequests(data.requests || []);
      setTotalRewards(Number(data.totalRewards || 0));
      setFeedback("");
    } catch {
      setFeedback("Unable to load pickup history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn || !rawUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser: StoredUser = JSON.parse(rawUser);
      if (!parsedUser?.token) {
        navigate("/login");
        return;
      }

      setUser(parsedUser);
      setTotalRewards(Number(parsedUser.rewardPoints || 0));
      loadRequests({
        "Content-Type": "application/json",
        Authorization: `Bearer ${parsedUser.token}`,
      });
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/scrap-requests`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ...formData,
          estimatedWeightKg: Number(formData.estimatedWeightKg),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.message || "Failed to submit pickup request");
        return;
      }

      setFeedback("Pickup request submitted successfully.");
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 1800);
      setFormData({
        scrapType: "plastic",
        estimatedWeightKg: "",
        address: "",
        preferredPickupDateTime: "",
      });

      const updatedUser = {
        ...user,
        rewardPoints: Number(data.totalRewards || totalRewards),
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("auth-changed"));

      await loadRequests(authHeaders);
    } catch {
      setFeedback("Unable to submit pickup request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="dashboard-page dashboard-layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {showConfetti && (
        <div className="confetti-wrap" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, index) => (
            <span
              key={index}
              className="confetti-piece"
              style={{
                left: `${(index * 5) % 100}%`,
                animationDelay: `${(index % 8) * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="dashboard-grid">
        <motion.section
          className="dashboard-card booking-card"
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
        >
          <h1>Smart Scrap Pickup Booking</h1>
          <p className="dashboard-email">Signed in as {user?.email || "Unknown user"}</p>

          <form onSubmit={handleSubmit} className="pickup-form">
            <label>
              <span className="label-row">
                <Recycle size={16} aria-hidden="true" />
                Scrap Type
              </span>
              <select name="scrapType" value={formData.scrapType} onChange={handleChange} required>
                <option value="plastic">Plastic (Rs.10/kg)</option>
                <option value="metal">Metal (Rs.25/kg)</option>
                <option value="paper">Paper (Rs.8/kg)</option>
                <option value="e-waste">E-waste (Rs.15/kg)</option>
              </select>
            </label>

            <label>
              <span className="label-row">
                <Weight size={16} aria-hidden="true" />
                Estimated Weight (kg)
              </span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                name="estimatedWeightKg"
                value={formData.estimatedWeightKg}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span className="label-row">
                <MapPin size={16} aria-hidden="true" />
                Pickup Address
              </span>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span className="label-row">
                <CalendarClock size={16} aria-hidden="true" />
                Preferred Pickup Date & Time
              </span>
              <input
                type="datetime-local"
                name="preferredPickupDateTime"
                value={formData.preferredPickupDateTime}
                onChange={handleChange}
                required
              />
            </label>

            <motion.div
              className="estimate-box stats-card"
              aria-live="polite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24, ease: "easeOut" }}
            >
              <div className="estimate-heading">
                <span className="estimate-icon" aria-hidden="true">
                  <Wallet size={18} />
                </span>
                <span>Estimated Payout</span>
              </div>
              <p className="estimate-price-badge">Rs.{estimatedPrice.toFixed(2)}</p>
              <p>
                Reward Points:{" "}
                <strong>{Math.round(Number(formData.estimatedWeightKg || 0) * 10)}</strong>
              </p>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={isSubmitting ? "is-submitting" : ""}
              whileHover={isSubmitting ? undefined : { scale: 1.02, y: -2 }}
              whileTap={isSubmitting ? undefined : { scale: 0.98 }}
              animate={isSubmitting ? undefined : { y: [0, -2, 0] }}
              transition={
                isSubmitting
                  ? { duration: 0.4 }
                  : {
                      duration: 0.8,
                      repeat: Infinity,
                      repeatType: "loop",
                      repeatDelay: 2.6,
                      ease: "easeInOut",
                    }
              }
            >
              {isSubmitting ? (
                <span className="button-loading">
                  <span className="truck-track" aria-hidden="true">
                    <Truck size={16} />
                  </span>
                  <span>Booking Pickup...</span>
                </span>
              ) : (
                "Request Pickup"
              )}
            </motion.button>
          </form>

          {feedback && <p className="dashboard-feedback">{feedback}</p>}

          <motion.button
            type="button"
            onClick={handleLogout}
            className="dashboard-logout-btn"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            Logout
          </motion.button>
        </motion.section>

        <motion.section
          className="dashboard-card history-card"
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease: "easeOut" }}
        >
          <h2>Your Pickup Requests</h2>
          <motion.div
            className="reward-total stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
          >
            <span className="stat-icon-circle" aria-hidden="true">
              <Recycle size={16} />
            </span>
            <p>
              Total Rewards: <strong>{totalRewards}</strong> points
            </p>
          </motion.div>

          {isLoadingHistory ? (
            <motion.p
              className="history-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            >
              Loading requests...
            </motion.p>
          ) : requests.length === 0 ? (
            <p>No pickup requests yet.</p>
          ) : (
            <div className="request-list">
              {requests.map((request, index) => (
                <motion.article
                  key={request._id}
                  className="request-item"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.28 + index * 0.06, ease: "easeOut" }}
                >
                  <div className="request-top">
                    <h3>{request.scrapType.toUpperCase()}</h3>
                    <span className={`status-chip status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>
                  <p>Weight: {request.estimatedWeightKg} kg</p>
                  <p>Price: Rs.{Number(request.estimatedPrice).toFixed(2)}</p>
                  <p>Points: {request.rewardPoints}</p>
                  <p>Address: {request.address}</p>
                  <p>Pickup: {new Date(request.preferredPickupDateTime).toLocaleString()}</p>
                </motion.article>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Dashboard;
