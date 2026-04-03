import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config/apiBaseUrl";
import "../styles/Dashboard.css";
import { CalendarClock, MapPin, Recycle, Truck, Calculator, CheckCircle2, Weight, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { formatRequestStatusLabel, formatScrapTypeLabel, getRequestWeight, type ScrapRequest } from "../utils/scrapRequests";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  token?: string;
  rewardPoints?: number;
};

type PricingRule = {
  category: string;
  minWeight: number;
  maxWeight: number;
  pricePerKg: number;
};

type MarketReason = {
  category: string;
  status: 'High' | 'Low' | 'Stable';
  reasonText: string;
};

const CATEGORIES = [
  { value: 'plastic', label: 'Plastic' },
  { value: 'metal', label: 'Metal' },
  { value: 'paper', label: 'Paper' },
  { value: 'ewaste', label: 'E-Waste' },
  { value: 'glass', label: 'Glass' },
  { value: 'others', label: 'Others' }
];

const DEFAULT_RATES: Record<string, number> = {
  'plastic': 8,
  'metal': 25,
  'paper': 10,
  'ewaste': 15,
  'glass': 5,
  'others': 6
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
  
  const [showPriceInfo, setShowPriceInfo] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    scrapType: "plastic",
    estimatedWeightKg: "",
    address: "",
    preferredPickupDateTime: "",
  });

  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [marketReasons, setMarketReasons] = useState<MarketReason[]>([]);

  // Market Fluctuation Logic (±5-10% based on category and time)
  const calculateMarketFluctuation = (baseRate: number, category: string) => {
    // Generate a pseudo-random multiplier between 0.9 and 1.1 based on category and current hour
    const seed = category.charCodeAt(0) + new Date().getHours();
    const fluctuation = 0.9 + (seed % 21) * 0.01; // 0.9 to 1.1 (±10%)
    return baseRate * fluctuation;
  };

  const currentRule = useMemo(() => {
    const weight = Number(formData.estimatedWeightKg) || 0;
    return pricingRules.find(
      (r) =>
        r.category.toLowerCase().replace(/[^a-z]/g, "") === formData.scrapType &&
        weight >= r.minWeight &&
        (r.maxWeight === null || r.maxWeight === undefined || r.maxWeight === 0 ? Infinity : r.maxWeight) > weight
    );
  }, [pricingRules, formData.scrapType, formData.estimatedWeightKg]);

  const currentRate = useMemo(() => {
    // Use fallback rate if no rule found
    const baseRate = currentRule ? currentRule.pricePerKg : (DEFAULT_RATES[formData.scrapType] || 0);
    
    // Apply market fluctuation
    return calculateMarketFluctuation(baseRate, formData.scrapType);
  }, [currentRule, formData.scrapType]);

  const currentReason = useMemo(() => {
    return marketReasons.find((r) => r.category.toLowerCase().replace(/[^a-z]/g, "") === formData.scrapType);
  }, [marketReasons, formData.scrapType]);

  const estimatedPrice = useMemo(() => {
    const weight = Number(formData.estimatedWeightKg);
    if (!Number.isFinite(weight) || weight <= 0) {
      return 0;
    }
    return weight * currentRate;
  }, [formData.estimatedWeightKg, currentRate]);

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

  const loadPricingData = async (headers: Record<string, string>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/pricing`, {
        method: "GET",
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPricingRules(data.data.rules || []);
        setMarketReasons(data.data.reasons || []);
      }
    } catch (err) {
      console.error("Failed to fetch pricing data. Using fallbacks.", err);
    }
  };

  const loadRequests = async (headers: Record<string, string>) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/scrap-requests/my-requests`, {
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
      
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${parsedUser.token}`,
      };
      
      loadRequests(headers);
      loadPricingData(headers);
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
      const res = await fetch(`${API_BASE_URL}/scrap-requests`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ...formData,
          estimatedWeightKg: Number(formData.estimatedWeightKg),
          ratePerKg: currentRate,
          estimatedPrice: estimatedPrice,
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
          className="dashboard-card booking-card dashboard-anchor-card"
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
        >
          <div id="profile-overview" className="dashboard-section-head">
            <h1>Smart Scrap Pickup Booking</h1>
            <p className="dashboard-email">Signed in as {user?.email || "Unknown user"}</p>
          </div>

          <form id="book-pickup" onSubmit={handleSubmit} className="pickup-form">
            <label>
              <span className="label-row">
                <Recycle size={16} aria-hidden="true" />
                Scrap Type
              </span>
              <select name="scrapType" value={formData.scrapType} onChange={handleChange} required>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
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
              <div className="estimate-row-main">
                <div className="estimate-primary">
                  <div className="estimate-heading">
                    <span className="estimate-icon" aria-hidden="true">
                      <Calculator size={18} />
                    </span>
                    <span>Estimated Payout</span>
                  </div>
                  
                  <div className="payout-breakdown">
                    <div className="breakdown-row">
                      <span>Rate:</span>
                      <strong>₹{currentRate.toFixed(2)}/kg</strong>
                      <div className="info-wrap">
                        <button
                          type="button"
                          className="price-info-btn"
                          onMouseEnter={() => setShowPriceInfo(true)}
                          onMouseLeave={() => setShowPriceInfo(false)}
                          onClick={() => setShowPriceInfo(!showPriceInfo)}
                        >
                          <Info size={14} />
                        </button>
                        <AnimatePresence>
                          {showPriceInfo && (
                             <motion.div 
                               className="price-info-tooltip"
                               initial={{ opacity: 0, scale: 0.9, y: 10 }}
                               animate={{ opacity: 1, scale: 1, y: 0 }}
                               exit={{ opacity: 0, scale: 0.9, y: 10 }}
                             >
                               <h5>Pricing Explanation</h5>
                               <p>Scrap prices change based on:</p>
                               <ul>
                                 <li>Market demand</li>
                                 <li>Recycling cost</li>
                                 <li>Material quality</li>
                                 <li>Transportation cost</li>
                               </ul>
                               <div className="tooltip-note">"Price may vary based on market demand, recycling cost, and supply."</div>
                             </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="breakdown-row">
                      <span>Weight:</span>
                      <strong>{formData.estimatedWeightKg || "0"} kg</strong>
                    </div>
                    <div className="breakdown-row total-row">
                      <span>Total Payout:</span>
                      <strong className={estimatedPrice > 500 ? "high-value" : ""}>
                        ₹{estimatedPrice.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="estimate-subtext">
                    {currentRule && (
                       <span className={`status-pill ${currentReason?.status?.toLowerCase() || 'stable'}`}>
                          {currentReason?.status === 'High' ? <TrendingUp size={12} /> : currentReason?.status === 'Low' ? <TrendingDown size={12} /> : <Minus size={12} />}
                          {currentReason?.status || 'Stable'}
                       </span>
                    )}
                  </div>
                </div>

                {currentReason && (
                   <div className="market-insight-box">
                      <div className="insight-header">
                        <TrendingUp size={14} />
                        <span>Market Insight</span>
                      </div>
                      <p className="insight-text">"{currentReason.reasonText}"</p>
                   </div>
                )}
              </div>

              <div className="estimate-footer-stats">
                <p>
                  Reward Points:{" "}
                  <strong>{Math.round(Number(formData.estimatedWeightKg || 0) * 10)}</strong>
                </p>
                {Number(formData.estimatedWeightKg) >= 20 && (
                   <span className="best-price-badge">✨ Best Price Applied</span>
                )}
              </div>
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
          id="track-request"
          className="dashboard-card history-card dashboard-anchor-card"
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease: "easeOut" }}
        >
          <h2>Track Your Requests</h2>
          <p className="dashboard-section-copy">Follow pending pickups, review payout estimates, and check the latest status of each scheduled collection.</p>
          <motion.div
            className="reward-total stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
          >
            <span className="stat-icon-circle" aria-hidden="true">
              <CheckCircle2 size={16} />
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
                    <h3>{formatScrapTypeLabel(request.scrapType)}</h3>
                    <span className={`status-chip status-${request.status.toLowerCase()}`}>
                      {formatRequestStatusLabel(request.status)}
                    </span>
                  </div>
                  <p>Weight: {getRequestWeight(request).toFixed(1)} kg</p>
                  <p>Price: ₹{Number(request.estimatedPrice).toFixed(2)}</p>
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

