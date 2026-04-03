import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarRange,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Filter,
  History,
  Leaf,
  Recycle,
  SearchX,
  Weight,
} from "lucide-react";
import { API_BASE_URL } from "../config/apiBaseUrl";
import "../styles/ScrapHistory.css";
import {
  ScrapRequest,
  formatCurrency,
  formatHistoryStatusLabel,
  formatRequestStatusLabel,
  formatScrapTypeLabel,
  getRequestAmount,
  getRequestPickupDate,
  getRequestWeight,
  isCompletedRequest,
  scrapTypeFilterOptions,
} from "../utils/scrapRequests";

type StoredUser = {
  token?: string;
};

const toInputDate = (value: string) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const localDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const ScrapHistory: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ScrapRequest[]>([]);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn || !rawUser) {
      navigate("/login");
      return;
    }

    let parsedUser: StoredUser | null = null;
    try {
      parsedUser = JSON.parse(rawUser) as StoredUser;
    } catch {
      navigate("/login");
      return;
    }

    if (!parsedUser?.token) {
      navigate("/login");
      return;
    }

    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/scrap-requests/my-requests`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsedUser?.token || ""}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          setFeedback(data.message || "Unable to load scrap history.");
          setRequests([]);
          return;
        }

        setRequests(data.requests || []);
        setFeedback("");
      } catch {
        setFeedback("Unable to load scrap history.");
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadRequests();
  }, [navigate]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesType = selectedType === "all" || request.scrapType === selectedType;
      const matchesDate = !selectedDate || toInputDate(getRequestPickupDate(request)) === selectedDate;
      return matchesType && matchesDate;
    });
  }, [requests, selectedDate, selectedType]);

  const totalEarnings = useMemo(
    () =>
      filteredRequests.reduce((total, request) => {
        if (!isCompletedRequest(request.status)) {
          return total;
        }
        return total + getRequestAmount(request);
      }, 0),
    [filteredRequests]
  );

  const completedCount = useMemo(
    () => filteredRequests.filter((request) => isCompletedRequest(request.status)).length,
    [filteredRequests]
  );

  const pendingCount = filteredRequests.length - completedCount;

  return (
    <motion.div
      className="history-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="history-shell">
        <section className="history-hero-card">
          <div>
            <p className="history-eyebrow">Pickup timeline</p>
            <h1>Scrap History</h1>
            <p className="history-subtitle">
              Track every pickup, review your completed payouts, and stay updated on requests still in progress.
            </p>
          </div>

          <Link to="/dashboard#book-pickup" className="history-primary-cta">
            Book Pickup
          </Link>
        </section>

        <section className="history-stats-grid">
          <article className="history-stat-card">
            <span className="history-stat-icon">
              <CircleDollarSign size={18} />
            </span>
            <p>Total Earnings</p>
            <strong>{formatCurrency(totalEarnings)}</strong>
          </article>

          <article className="history-stat-card">
            <span className="history-stat-icon">
              <History size={18} />
            </span>
            <p>Total Requests</p>
            <strong>{filteredRequests.length}</strong>
          </article>

          <article className="history-stat-card">
            <span className="history-stat-icon">
              <CheckCircle2 size={18} />
            </span>
            <p>Completed Pickups</p>
            <strong>{completedCount}</strong>
          </article>

          <article className="history-stat-card">
            <span className="history-stat-icon">
              <Clock3 size={18} />
            </span>
            <p>Pending Pickups</p>
            <strong>{pendingCount}</strong>
          </article>
        </section>

        <section className="history-filter-card">
          <div className="history-filter-head">
            <div>
              <p className="history-filter-label">Filters</p>
              <h2>Refine your pickup list</h2>
            </div>
            <span className="history-filter-badge">
              <Filter size={16} />
              Responsive view
            </span>
          </div>

          <div className="history-filters">
            <label>
              <span>Scrap Type</span>
              <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                {scrapTypeFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Pickup Date</span>
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>
          </div>
        </section>

        {feedback && <p className="history-feedback">{feedback}</p>}

        {isLoading ? (
          <div className="history-empty-card">
            <span className="history-empty-icon">
              <Leaf size={20} />
            </span>
            <h3>Loading your pickup history...</h3>
            <p>We are fetching your latest scrap pickup records.</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="history-empty-card">
            <span className="history-empty-icon">
              <SearchX size={20} />
            </span>
            <h3>No pickup history found</h3>
            <p>Try changing the filters or book your first scrap pickup to get started.</p>
          </div>
        ) : (
          <section className="history-records-grid">
            {filteredRequests.map((request, index) => {
              const completed = isCompletedRequest(request.status);
              const statusLabel = formatHistoryStatusLabel(request.status);
              const amountLabel = completed ? "Earnings" : "Estimated Payout";
              const pickupDate = new Date(getRequestPickupDate(request));

              return (
                <motion.article
                  key={request._id}
                  className="history-record-card"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
                >
                  <div className="history-record-top">
                    <div className="history-record-title">
                      <span className="history-record-icon">
                        <Recycle size={18} />
                      </span>
                      <div>
                        <h3>{formatScrapTypeLabel(request.scrapType)}</h3>
                        <p>{formatRequestStatusLabel(request.status)}</p>
                      </div>
                    </div>

                    <span className={`history-status-pill ${completed ? "is-complete" : "is-pending"}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="history-record-details">
                    <div className="history-detail-item">
                      <Weight size={16} />
                      <div>
                        <span>Weight</span>
                        <strong>{getRequestWeight(request).toFixed(1)} kg</strong>
                      </div>
                    </div>

                    <div className="history-detail-item">
                      <CircleDollarSign size={16} />
                      <div>
                        <span>{amountLabel}</span>
                        <strong>{formatCurrency(getRequestAmount(request))}</strong>
                      </div>
                    </div>

                    <div className="history-detail-item">
                      <CalendarRange size={16} />
                      <div>
                        <span>Pickup Date</span>
                        <strong>
                          {Number.isNaN(pickupDate.getTime()) ? "Date unavailable" : pickupDate.toLocaleDateString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    <div className="history-detail-item">
                      <Clock3 size={16} />
                      <div>
                        <span>Status Detail</span>
                        <strong>{formatRequestStatusLabel(request.status)}</strong>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}
      </div>
    </motion.div>
  );
};

export default ScrapHistory;

