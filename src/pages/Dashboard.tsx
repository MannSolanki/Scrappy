import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiBaseUrl";
import "../styles/Dashboard.css";
import { CalendarClock, Coins, MapPin, Recycle, Truck, Weight } from "lucide-react";

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
    <div className="dashboard-page dashboard-layout">
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
        <section className="dashboard-card booking-card">
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

            <div className="estimate-box" aria-live="polite">
              <div className="estimate-heading">
                <Coins size={16} aria-hidden="true" />
                Estimated Payout
              </div>
              <p className="estimate-price-badge">Rs.{estimatedPrice.toFixed(2)}</p>
              <p>
                Reward Points:{" "}
                <strong>{Math.round(Number(formData.estimatedWeightKg || 0) * 10)}</strong>
              </p>
            </div>

            <button type="submit" disabled={isSubmitting} className={isSubmitting ? "is-submitting" : ""}>
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
            </button>
          </form>

          {feedback && <p className="dashboard-feedback">{feedback}</p>}

          <button type="button" onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </section>

        <section className="dashboard-card history-card">
          <h2>Your Pickup Requests</h2>
          <p className="reward-total">
            Total Rewards: <strong>{totalRewards}</strong> points
          </p>

          {isLoadingHistory ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
            <p>No pickup requests yet.</p>
          ) : (
            <div className="request-list">
              {requests.map((request) => (
                <article key={request._id} className="request-item">
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
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
