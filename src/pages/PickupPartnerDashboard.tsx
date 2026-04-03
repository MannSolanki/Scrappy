import React, { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { DirectionsRenderer, GoogleMap, Marker } from "@react-google-maps/api";
import { apiFetch } from "../api/apiClient";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock3,
  Crosshair,
  DollarSign,
  Loader2,
  MapPin,
  MapPinned,
  Navigation,
  Package,
  Route,
  Search,
  Truck,
  User,
  Weight,
  X,
} from "lucide-react";
import "../styles/PickupPartnerDashboard.css";

type StoredUser = { id?: string; name?: string; email?: string; role?: string; token?: string };
type RequestUser = { name?: string; email?: string };
type PickupStatus = "pending" | "approved" | "accepted" | "on_the_way" | "reached" | "completed" | "rejected";
type FlowStage = "pending" | "accepted" | "on_the_way" | "reached" | "completed";
type FilterTab = "all" | "pending" | "active" | "completed";
type PickupRequest = {
  _id: string;
  user?: RequestUser | string;
  address: string;
  scrapType: string;
  estimatedWeightKg: number;
  preferredPickupDateTime: string;
  status: PickupStatus;
  collectedAmount?: number;
  collectedWeightKg?: number;
  completedAt?: string;
  ratePerKg?: number;
  createdAt?: string;
  pickupLocation?: { lat: number; lng: number };
};
type PricingRule = { category: string; minWeight?: number; maxWeight?: number | null; pricePerKg?: number };
type Ripple = { id: number; size: number; x: number; y: number };
type RippleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode };

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultMapCenter = { lat: 20.5937, lng: 78.9629 };
const FLOW_STEPS: FlowStage[] = ["accepted", "on_the_way", "reached", "completed"];
const FILTER_TABS: Array<{ key: FilterTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

const normalizeUserLabel = (user: PickupRequest["user"]) => {
  if (!user) return "Unknown customer";
  if (typeof user === "string") return user;
  return user.name || user.email || "Unknown customer";
};

const normalizeScrapType = (value = "") => String(value).toLowerCase().trim().replace(/[^a-z]/g, "");
const getBackendMessage = (data: any, fallback: string) => (data?.message ? String(data.message) : fallback);
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(
    Number.isFinite(amount) ? amount : 0
  );

const getFlowStage = (status: PickupStatus | string): FlowStage => {
  const current = String(status || "").toLowerCase();
  if (current === "accepted") return "accepted";
  if (current === "on_the_way") return "on_the_way";
  if (current === "reached") return "reached";
  if (current === "completed") return "completed";
  return "pending";
};

const getStatusLabel = (status: PickupStatus | FlowStage | string) => {
  const stage = getFlowStage(status);
  if (stage === "pending") return "Pending";
  if (stage === "accepted") return "Accepted";
  if (stage === "on_the_way") return "On The Way";
  if (stage === "reached") return "Reached";
  return "Completed";
};

const getActionForStage = (stage: FlowStage) => {
  if (stage === "pending") return { status: "accepted" as const, label: "Accept", icon: CheckCircle2 };
  if (stage === "accepted") return { status: "on_the_way" as const, label: "On The Way", icon: Truck };
  if (stage === "on_the_way") return { status: "reached" as const, label: "Reached", icon: MapPinned };
  if (stage === "reached") return { status: "completed" as const, label: "Complete Pickup", icon: Package };
  return null;
};

const getActionButtonClassName = (status: "accepted" | "on_the_way" | "reached" | "completed") => {
  if (status === "accepted") {
    return "pickup-action-btn pickup-action-btn-primary";
  }
  if (status === "completed") {
    return "pickup-action-btn pickup-action-btn-secondary";
  }
  return "pickup-action-btn pickup-action-btn-neutral";
};

const getBucket = (status: PickupStatus | string): FilterTab => {
  const stage = getFlowStage(status);
  if (stage === "completed") return "completed";
  if (stage === "pending") return "pending";
  return "active";
};

const getStageIndex = (stage: FlowStage) => (stage === "pending" ? -1 : FLOW_STEPS.indexOf(stage));

const resolvePricePerKg = (request: PickupRequest | null, weightKg: number, pricingRules: PricingRule[]) => {
  if (!request) return 0;
  const normalizedType = normalizeScrapType(request.scrapType);
  const safeWeight = Number(weightKg);
  const matched = pricingRules.find((rule) => {
    const minWeight = Number(rule.minWeight || 0);
    const rawMax = Number(rule.maxWeight);
    const maxWeight = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : Number.POSITIVE_INFINITY;
    return normalizeScrapType(rule.category) === normalizedType && safeWeight >= minWeight && safeWeight < maxWeight;
  });
  return Number(matched?.pricePerKg || request.ratePerKg || 0);
};

const getMarkerIcon = (fillColor: string, scale: number): google.maps.Symbol | undefined => {
  if (!window.google?.maps) return undefined;
  return { path: window.google.maps.SymbolPath.CIRCLE, fillColor, fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3, scale };
};

const RippleButton = ({ children, className = "", disabled, onClick, type = "button", ...props }: RippleButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const ripple = { id: idRef.current++, size, x: event.clientX - rect.left - size / 2, y: event.clientY - rect.top - size / 2 };
    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => setRipples((current) => current.filter((item) => item.id !== ripple.id)), 650);
    onClick?.(event);
  };
  return (
    <button {...props} type={type} disabled={disabled} onClick={handleClick} className={`pickup-ripple-btn ${className}`}>
      <span className="pickup-ripple-content">{children}</span>
      <span className="pickup-ripple-layer" aria-hidden="true">
        {ripples.map((ripple) => (
          <span key={ripple.id} className="pickup-ripple" style={{ width: ripple.size, height: ripple.size, left: ripple.x, top: ripple.y }} />
        ))}
      </span>
    </button>
  );
};

const PickupPartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").trim();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [isUpdatingId, setIsUpdatingId] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [mapRequest, setMapRequest] = useState<PickupRequest | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [mapDistance, setMapDistance] = useState("");
  const [mapDuration, setMapDuration] = useState("");
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(Boolean(window.google?.maps));
  const [mapLoadError, setMapLoadError] = useState("");
  const [completionRequest, setCompletionRequest] = useState<PickupRequest | null>(null);
  const [actualWeight, setActualWeight] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    if (!googleMapsApiKey) {
      setIsMapLoaded(false);
      setMapLoadError("Missing Google Maps API key. Add VITE_GOOGLE_MAPS_API_KEY to your local env file.");
      return;
    }

    if (window.google?.maps) {
      setIsMapLoaded(true);
      setMapLoadError("");
      return;
    }

    const scriptId = "google-maps-script";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const handleLoad = () => {
      setIsMapLoaded(true);
      setMapLoadError("");
    };

    const handleError = () => {
      setIsMapLoaded(false);
      setMapLoadError("Unable to load Google Maps. Verify your API key and billing setup.");
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [googleMapsApiKey]);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return void navigate("/login", { replace: true });
    try {
      const parsedUser = JSON.parse(rawUser) as StoredUser;
      if (String(parsedUser.role || "").toLowerCase() !== "pickup_partner") return void navigate("/home", { replace: true });
      setUser(parsedUser);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const getLocation = (): Promise<google.maps.LatLngLiteral | null> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  const loadRequests = async () => {
    const response = await apiFetch("/pickup/requests", { method: "GET" });
    const data = await response.json();
    if (!response.ok) throw new Error(getBackendMessage(data, "Unable to load pickup requests."));
    startTransition(() => setRequests(data.requests || []));
  };

  const loadPricingRules = async () => {
    try {
      const response = await apiFetch("/pricing", { method: "GET" });
      const data = await response.json();
      if (response.ok && data.success) setPricingRules(data.data?.rules || []);
    } catch {
      setPricingRules([]);
    }
  };

  useEffect(() => {
    if (!user?.token && !localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }
    const bootstrap = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadRequests(), loadPricingRules()]);
      } catch (error: any) {
        toast.error(error.message || "Could not load dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [navigate, user]);

  useEffect(() => {
    let cancelled = false;
    if (!mapRequest) {
      setDirectionsResponse(null);
      setMapDistance("");
      setMapDuration("");
      setDestinationLocation(null);
      return;
    }

    const loadRoute = async () => {
      setIsRouteLoading(true);
      const currentLocation = await getLocation();
      if (cancelled) return;
      setUserLocation(currentLocation);

      if (!isMapLoaded || !window.google?.maps || !currentLocation) {
        setDestinationLocation(mapRequest.pickupLocation || null);
        setIsRouteLoading(false);
        return;
      }

      const directionsService = new window.google.maps.DirectionsService();
      try {
        const results = await directionsService.route({
          origin: currentLocation,
          destination: mapRequest.pickupLocation || mapRequest.address,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });
        if (cancelled) return;
        const leg = results.routes[0]?.legs[0];
        setDirectionsResponse(results);
        setMapDistance(leg?.distance?.text || "");
        setMapDuration(leg?.duration?.text || "");
        if (leg?.end_location) {
          setDestinationLocation({ lat: leg.end_location.lat(), lng: leg.end_location.lng() });
        } else {
          setDestinationLocation(mapRequest.pickupLocation || null);
        }
      } catch {
        if (!cancelled) {
          setDirectionsResponse(null);
          setDestinationLocation(mapRequest.pickupLocation || null);
          toast.error("Could not calculate the route for this pickup.");
        }
      } finally {
        if (!cancelled) setIsRouteLoading(false);
      }
    };

    void loadRoute();
    return () => {
      cancelled = true;
    };
  }, [isMapLoaded, mapRequest]);

  const stats = useMemo(() => {
    const todayKey = new Date().toDateString();
    return requests.reduce(
      (summary, request) => {
        const stage = getFlowStage(request.status);
        if (stage === "completed") {
          summary.earnings += Number(request.collectedAmount || 0);
          summary.completed += 1;
          if (request.completedAt && new Date(request.completedAt).toDateString() === todayKey) summary.todayCompleted += 1;
        }
        if (stage === "pending") summary.pending += 1;
        if (stage === "accepted" || stage === "on_the_way" || stage === "reached") summary.live += 1;
        return summary;
      },
      { earnings: 0, completed: 0, todayCompleted: 0, pending: 0, live: 0 }
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        normalizeUserLabel(request.user).toLowerCase().includes(query) ||
        request.address.toLowerCase().includes(query) ||
        request.scrapType.toLowerCase().includes(query);
      if (!matchesSearch) return false;
      if (activeTab === "all") return true;
      return getBucket(request.status) === activeTab;
    });
  }, [activeTab, deferredSearch, requests]);

  const completionWeightValue = Number(actualWeight);
  const completionRatePerKg = useMemo(
    () => resolvePricePerKg(completionRequest, completionWeightValue, pricingRules),
    [completionRequest, completionWeightValue, pricingRules]
  );
  const completionAmount = useMemo(() => {
    if (!Number.isFinite(completionWeightValue) || completionWeightValue <= 0) return 0;
    return Number((completionWeightValue * completionRatePerKg).toFixed(2));
  }, [completionRatePerKg, completionWeightValue]);

  const handleUpdateStatus = async (
    request: PickupRequest,
    nextStatus: "accepted" | "on_the_way" | "reached" | "completed",
    extra?: { collectedWeightKg?: number; pickupLocation?: google.maps.LatLngLiteral | null }
  ) => {
    setIsUpdatingId(request._id);
    setUpdatingStatus(nextStatus);
    const payload: Record<string, any> = { status: nextStatus, scrapType: request.scrapType };
    if (typeof extra?.collectedWeightKg === "number") payload.collectedWeightKg = extra.collectedWeightKg;
    if (extra?.pickupLocation) payload.pickupLocation = extra.pickupLocation;
    if (nextStatus === "completed" && !payload.pickupLocation) payload.pickupLocation = await getLocation();

    try {
      const endpoint =
        nextStatus === "accepted"
          ? `/pickup/accept/${request._id}`
          : `/pickup/requests/${request._id}/status`;

      const response = await apiFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getBackendMessage(data, "Unable to update pickup status."));
      const earnedAmount = nextStatus === "completed" ? Number(data.amount || completionAmount || 0) : 0;
      startTransition(() => {
        setRequests((current) =>
          current.map((item) =>
            item._id === request._id
              ? {
                  ...item,
                  ...(data.request || {}),
                  status: nextStatus,
                  ...(typeof extra?.collectedWeightKg === "number" ? { collectedWeightKg: extra.collectedWeightKg } : {}),
                  ...(nextStatus === "completed" ? { collectedAmount: earnedAmount, completedAt: data.request?.completedAt || new Date().toISOString() } : {}),
                }
              : item
          )
        );
      });
      if (nextStatus === "accepted") toast.success("Pickup accepted.");
      if (nextStatus === "on_the_way") toast.success("Marked as on the way.");
      if (nextStatus === "reached") toast.success("You have reached the pickup point.");
      if (nextStatus === "completed") {
        toast.success(`Pickup completed! ${formatCurrency(earnedAmount)} added`);
        setCompletionRequest(null);
        setActualWeight("");
      }
    } catch (error: any) {
      toast.error(error.message || "Status update failed.");
    } finally {
      setIsUpdatingId("");
      setUpdatingStatus("");
    }
  };

  const handleCompletePickup = async () => {
    if (!completionRequest) return;
    if (!Number.isFinite(completionWeightValue) || completionWeightValue <= 0) {
      toast.error("Enter a valid weight to complete this pickup.");
      return;
    }
    const pickupLocation = await getLocation();
    await handleUpdateStatus(completionRequest, "completed", { collectedWeightKg: completionWeightValue, pickupLocation });
  };

  const handleStartNavigation = () => {
    if (!mapRequest) return;
    const destination = mapRequest.pickupLocation
      ? `${mapRequest.pickupLocation.lat},${mapRequest.pickupLocation.lng}`
      : encodeURIComponent(mapRequest.address);
    const origin = userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : "";
    window.open(`https://www.google.com/maps/dir/?api=1${origin}&destination=${destination}`, "_blank");
  };

  return (
    <div className="pickup-partner-shell min-h-screen text-slate-900 pb-16">
      <Toaster position="top-center" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-600">Pickup Partner</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Delivery-style pickup operations
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Manage live pickups, open route guidance in full screen, and close tasks with exact weight-based payouts.
            </p>
          </div>

          <div className="pickup-stat-card flex items-center gap-3 rounded-[28px] px-5 py-4">
            <div className="rounded-full bg-slate-100 p-2.5 text-slate-700">
              <Clock3 size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Today</p>
              <p className="text-sm font-semibold text-slate-700">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="pickup-stat-card rounded-[30px] bg-white px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
                <DollarSign size={20} />
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Real-time</span>
            </div>
            <p className="text-sm text-slate-500">Total Earnings</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{formatCurrency(stats.earnings)}</h2>
            <p className="mt-2 text-sm text-slate-500">{stats.completed} pickups completed so far</p>
          </div>

          <div className="pickup-stat-card rounded-[30px] bg-white px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-amber-50 p-3 text-amber-600">
                <Package size={20} />
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {stats.pending} waiting
              </span>
            </div>
            <p className="text-sm text-slate-500">Pending Pickups</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{stats.pending}</h2>
            <p className="mt-2 text-sm text-slate-500">Ready to accept and route</p>
          </div>

          <div className="pickup-stat-card rounded-[30px] bg-white px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
                <Route size={20} />
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {stats.todayCompleted} closed today
              </span>
            </div>
            <p className="text-sm text-slate-500">Live Tasks</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{stats.live}</h2>
            <p className="mt-2 text-sm text-slate-500">Accepted, on the way, and reached tasks</p>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
                    : "bg-white text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:text-slate-950"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="relative block w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search customer, scrap type, or address"
              className="h-11 w-full rounded-full border border-white/60 bg-white/90 pl-11 pr-4 text-sm text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.06)] outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="pickup-request-card rounded-[30px] p-5">
                <div className="pickup-skeleton-shimmer h-5 w-28 rounded-full" />
                <div className="pickup-skeleton-shimmer mt-4 h-7 w-40 rounded-2xl" />
                <div className="pickup-skeleton-shimmer mt-6 h-14 rounded-2xl" />
                <div className="pickup-skeleton-shimmer mt-4 h-20 rounded-[24px]" />
                <div className="pickup-skeleton-shimmer mt-6 h-10 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="pickup-stat-card rounded-[32px] px-8 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Package size={22} />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">No pickups in this view</h3>
            <p className="mt-2 text-sm text-slate-500">Try another filter or search for a different customer or address.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filteredRequests.map((request) => {
                const stage = getFlowStage(request.status);
                const action = getActionForStage(stage);
                const isProcessing = isUpdatingId === request._id;
                const stageIndex = getStageIndex(stage);
                const completedAmount = Number(request.collectedAmount || 0);
                const actualCollectedWeight = Number(request.collectedWeightKg || 0);

                return (
                  <motion.article
                    key={request._id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="pickup-request-card flex flex-col rounded-[30px] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Pickup #{request._id.slice(-5)}</p>
                        <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{normalizeUserLabel(request.user)}</h2>
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Calendar size={14} />
                          <span>{new Date(request.preferredPickupDateTime).toLocaleString()}</span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          stage === "completed"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : stage === "reached"
                              ? "border-amber-100 bg-amber-50 text-amber-700"
                              : stage === "on_the_way"
                                ? "border-sky-100 bg-sky-50 text-sky-700"
                                : stage === "accepted"
                                  ? "border-slate-200 bg-slate-100 text-slate-700"
                                  : "border-amber-100 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        <span>Progress</span>
                        <span>{getStatusLabel(request.status)}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {FLOW_STEPS.map((step, index) => {
                          const isStepComplete = index <= stageIndex;
                          const isCurrentStep = stage === step;
                          return (
                            <div key={step} className="pickup-progress-step">
                              <div className={`pickup-progress-dot ${isStepComplete ? "is-complete" : ""} ${isCurrentStep ? "is-current" : ""}`} />
                              {index < FLOW_STEPS.length - 1 && (
                                <div className={`pickup-progress-line ${index < stageIndex ? "is-complete" : ""}`} />
                              )}
                              <span className="mt-2 block text-[11px] font-medium text-slate-500">
                                {step === "on_the_way" ? "On way" : step === "completed" ? "Done" : getStatusLabel(step)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          <User size={12} />
                          Customer
                        </div>
                        <p className="text-sm font-semibold text-slate-700">{normalizeUserLabel(request.user)}</p>
                      </div>

                      <div className="pickup-address-card rounded-[24px] border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="shrink-0 text-emerald-600" size={16} />
                          <button
                            type="button"
                            title={request.address}
                            onClick={() => setMapRequest(request)}
                            className="pickup-address-link min-w-0 flex-1 text-left text-sm text-[#374151]"
                          >
                            <span className="block truncate">{request.address}</span>
                          </button>
                          <button
                            type="button"
                            title="View Map"
                            onClick={() => setMapRequest(request)}
                            className="pickup-map-button flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            aria-label="View Map"
                          >
                            <MapPinned size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Scrap</p>
                          <p className="mt-1 text-sm font-semibold capitalize text-slate-800">{request.scrapType}</p>
                        </div>
                        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Est. Wt</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">{request.estimatedWeightKg} kg</p>
                        </div>
                        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Rate</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(Number(request.ratePerKg || 0))}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4">
                      {stage === "completed" ? (
                        <div className="rounded-[24px] border border-emerald-100 bg-white px-4 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Added To Earnings</p>
                              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{formatCurrency(completedAmount)}</p>
                            </div>
                            <CheckCircle2 className="text-emerald-600" size={28} />
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                            <span>Actual weight</span>
                            <strong className="text-slate-900">{actualCollectedWeight > 0 ? `${actualCollectedWeight} kg` : "--"}</strong>
                          </div>
                        </div>
                      ) : action ? (
                        <RippleButton
                          disabled={isProcessing}
                          onClick={() => {
                            if (action.status === "completed") {
                              setCompletionRequest(request);
                              setActualWeight(String(request.estimatedWeightKg || ""));
                              return;
                            }
                            void handleUpdateStatus(request, action.status);
                          }}
                          className={`h-11 w-full rounded-full px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${getActionButtonClassName(action.status)}`}
                        >
                          {isProcessing && updatingStatus === action.status ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              {action.status === "accepted"
                                ? "Accepting..."
                                : action.status === "on_the_way"
                                  ? "Updating..."
                                  : action.status === "reached"
                                    ? "Marking reached..."
                                    : "Completing..."}
                            </>
                          ) : (
                            <>
                              <action.icon size={16} />
                              {action.label}
                            </>
                          )}
                        </RippleButton>
                      ) : (
                        <div className="rounded-[20px] bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500">
                          This task is not available for action right now.
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {completionRequest && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => {
                setCompletionRequest(null);
                setActualWeight("");
              }}
              aria-label="Close completion modal"
            />

            <motion.div
              initial={{ y: 20, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.97, opacity: 0 }}
              className="pickup-stat-card relative z-10 w-full max-w-md rounded-[32px] bg-white p-6"
            >
              <button
                type="button"
                onClick={() => {
                  setCompletionRequest(null);
                  setActualWeight("");
                }}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:text-slate-900"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Complete Pickup</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Enter actual collection weight</h3>
                <p className="mt-2 text-sm text-slate-500">The payout is calculated instantly using the current scrap price per kg.</p>
              </div>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Weight size={16} />
                  Actual weight
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={actualWeight}
                    onChange={(event) => setActualWeight(event.target.value)}
                    className="h-14 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-5 pr-14 text-lg font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                    placeholder="0.0"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">kg</span>
                </div>
              </label>

              <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Customer</span>
                  <strong className="text-slate-800">{normalizeUserLabel(completionRequest.user)}</strong>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>Scrap price</span>
                  <strong className="text-slate-800">{formatCurrency(completionRatePerKg)}/kg</strong>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>Weight x Rate</span>
                  <strong className="text-slate-800">
                    {(Number.isFinite(completionWeightValue) ? completionWeightValue : 0).toFixed(1)} kg x {formatCurrency(completionRatePerKg)}
                  </strong>
                </div>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Calculated price</span>
                    <span className="text-2xl font-bold tracking-tight text-emerald-700">{formatCurrency(completionAmount)}</span>
                  </div>
                </div>
              </div>

              <RippleButton
                disabled={isUpdatingId === completionRequest._id || !actualWeight}
                onClick={() => {
                  void handleCompletePickup();
                }}
                className="mt-5 h-10 w-full rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(5,150,105,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingId === completionRequest._id && updatingStatus === "completed" ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirm Pickup
                  </>
                )}
              </RippleButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mapRequest && (
          <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0 bg-slate-950/70" onClick={() => setMapRequest(null)} aria-label="Close map" />

            <div className="relative h-full w-full overflow-hidden">
              <div className="absolute inset-0">
                {!googleMapsApiKey ? (
                  <div className="flex h-full items-center justify-center bg-slate-900 text-white">
                    <div className="max-w-md px-6 text-center">
                      <Navigation className="mx-auto" size={28} />
                      <p className="mt-4 text-lg font-semibold">Google Maps API key required</p>
                      <p className="mt-2 text-sm text-white/80">
                        Please add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your local env file, then restart Vite.
                      </p>
                    </div>
                  </div>
                ) : isMapLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={userLocation || destinationLocation || defaultMapCenter}
                    zoom={userLocation || destinationLocation ? 14 : 5}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                      clickableIcons: false,
                      fullscreenControl: false,
                      streetViewControl: false,
                      mapTypeControl: false,
                    }}
                  >
                    {directionsResponse && (
                      <DirectionsRenderer
                        directions={directionsResponse}
                        options={{
                          suppressMarkers: true,
                          polylineOptions: { strokeColor: "#0f766e", strokeOpacity: 0.88, strokeWeight: 6 },
                        }}
                      />
                    )}
                    {userLocation && <Marker position={userLocation} icon={getMarkerIcon("#2563eb", 8)} />}
                    {destinationLocation && <Marker position={destinationLocation} icon={getMarkerIcon("#f97316", 10)} />}
                  </GoogleMap>
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-900 text-white">
                    <div className="max-w-md px-6 text-center">
                      {mapLoadError ? <Navigation className="mx-auto" size={28} /> : <Loader2 className="mx-auto animate-spin" size={28} />}
                      <p className="mt-3 text-sm text-white/80">{mapLoadError || "Loading map..."}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 sm:p-6">
                <div className="pickup-map-topbar pointer-events-auto mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-[28px] px-4 py-3 sm:px-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live Route</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">{normalizeUserLabel(mapRequest.user)}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMapRequest(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                    aria-label="Close map"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <motion.div
                initial={{ y: 180, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 180, opacity: 0 }}
                transition={{ type: "spring", stiffness: 170, damping: 22 }}
                className="pickup-map-sheet absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-4xl rounded-t-[34px] px-5 pb-6 pt-4 sm:px-6"
              >
                <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-200" />
                <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-end">
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-full bg-amber-50 p-3 text-amber-600">
                        <Navigation size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Route Summary</p>
                        <h4 className="text-xl font-bold tracking-tight text-slate-950">{isRouteLoading ? "Calculating route..." : mapDistance || "Route ready"}</h4>
                        <p className="text-sm text-slate-500">{mapDuration ? `${mapDuration} away` : "Enable location for live directions"}</p>
                      </div>
                    </div>

                    <div className="rounded-[24px] bg-slate-50 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 text-amber-600" size={16} />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Address</p>
                          <p className="mt-1 text-sm font-medium leading-6 text-slate-700">{mapRequest.address}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <User size={14} />
                          {normalizeUserLabel(mapRequest.user)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Crosshair size={14} />
                          {mapDistance || "Distance pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <RippleButton
                      onClick={handleStartNavigation}
                      className="h-10 w-full rounded-full bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
                    >
                      <Navigation size={16} />
                      Start Navigation
                      <ArrowUpRight size={16} />
                    </RippleButton>

                    <button
                      type="button"
                      onClick={() => setMapRequest(null)}
                      className="h-10 rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Back to tasks
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PickupPartnerDashboard;
