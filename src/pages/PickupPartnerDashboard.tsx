import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PickupPartnerDashboard.css";

const API_BASE_URL = "http://localhost:5000";

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  token?: string;
};

type RequestUser = {
  name?: string;
  email?: string;
};

type PickupRequest = {
  _id: string;
  user?: RequestUser | string;
  address: string;
  scrapType: string;
  estimatedWeightKg: number;
  preferredPickupDateTime: string;
  status: "approved" | "on_the_way" | "completed" | "pending" | "rejected";
};

const normalizeUserLabel = (user: PickupRequest["user"]) => {
  if (!user) return "Unknown user";
  if (typeof user === "string") return user;
  return user.name || user.email || "Unknown user";
};

const PickupPartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const authHeaders = useMemo(() => {
    const token = user?.token || localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [user]);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(rawUser) as StoredUser;
      if (String(parsed.role || "").toLowerCase() !== "pickup_partner") {
        navigate("/home", { replace: true });
        return;
      }
      setUser(parsed);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const loadRequests = async (headers: Record<string, string>) => {
    setIsLoading(true);
    setFeedback("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup-partner/requests`, {
        method: "GET",
        headers,
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message || "Unable to load assigned requests.");
        return;
      }
      setRequests(data.requests || []);
    } catch {
      setFeedback("Unable to load assigned requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token && !localStorage.getItem("token")) {
      return;
    }
    void loadRequests(authHeaders);
  }, [user, authHeaders]);

  const updateStatus = async (requestId: string, status: "on_the_way" | "completed") => {
    setIsUpdatingId(requestId);
    setFeedback("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup-partner/requests/${requestId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message || "Unable to update pickup status.");
        return;
      }

      setRequests((previous) =>
        previous.map((request) => (request._id === requestId ? data.request : request))
      );
      setFeedback("Pickup status updated successfully.");
    } catch {
      setFeedback("Unable to update pickup status.");
    } finally {
      setIsUpdatingId("");
    }
  };

  return (
    <div className="partner-page">
      <section className="partner-card">
        <div className="partner-header">
          <h1>Pickup Partner Dashboard</h1>
          <p>Welcome {user?.name || "Partner"}. Manage assigned pickups below.</p>
        </div>

        {feedback && <p className="partner-feedback">{feedback}</p>}

        {isLoading ? (
          <p className="partner-loading">Loading assigned pickup requests...</p>
        ) : requests.length === 0 ? (
          <p className="partner-loading">No assigned pickup requests right now.</p>
        ) : (
          <div className="partner-request-list">
            {requests.map((request) => {
              const normalizedStatus = String(request.status || "").toLowerCase();
              const isProcessing = isUpdatingId === request._id;
              return (
                <article key={request._id} className="partner-request-item">
                  <div className="partner-request-top">
                    <h2>{normalizeUserLabel(request.user)}</h2>
                    <span className={`partner-status status-${normalizedStatus}`}>{normalizedStatus}</span>
                  </div>

                  <div className="partner-request-grid">
                    <p>
                      <strong>Address:</strong> {request.address}
                    </p>
                    <p>
                      <strong>Scrap Type:</strong> {request.scrapType}
                    </p>
                    <p>
                      <strong>Weight:</strong> {request.estimatedWeightKg} kg
                    </p>
                    <p>
                      <strong>Pickup Time:</strong> {new Date(request.preferredPickupDateTime).toLocaleString()}
                    </p>
                  </div>

                  <div className="partner-actions">
                    <button
                      type="button"
                      disabled={isProcessing || normalizedStatus !== "approved"}
                      onClick={() => updateStatus(request._id, "on_the_way")}
                    >
                      Mark as On The Way
                    </button>
                    <button
                      type="button"
                      className="complete-btn"
                      disabled={isProcessing || !["on_the_way", "approved"].includes(normalizedStatus)}
                      onClick={() => updateStatus(request._id, "completed")}
                    >
                      Mark as Completed
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default PickupPartnerDashboard;
