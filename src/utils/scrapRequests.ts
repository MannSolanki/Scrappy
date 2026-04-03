export type ScrapRequestStatus =
  | "pending"
  | "approved"
  | "accepted"
  | "on_the_way"
  | "reached"
  | "rejected"
  | "completed";

export type ScrapRequest = {
  _id: string;
  scrapType: string;
  estimatedWeightKg: number;
  address: string;
  preferredPickupDateTime: string;
  ratePerKg: number;
  estimatedPrice: number;
  rewardPoints: number;
  status: ScrapRequestStatus;
  createdAt: string;
  collectedWeightKg?: number | null;
  collectedAmount?: number | null;
  completedAt?: string | null;
};

const scrapTypeLabels: Record<string, string> = {
  plastic: "Plastic",
  metal: "Metal",
  paper: "Paper",
  ewaste: "E-Waste",
  glass: "Glass",
  others: "Others",
};

const statusLabels: Record<ScrapRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  accepted: "Accepted",
  on_the_way: "On the way",
  reached: "Reached",
  rejected: "Rejected",
  completed: "Completed",
};

export const scrapTypeFilterOptions = [
  { value: "all", label: "All scrap types" },
  { value: "plastic", label: "Plastic" },
  { value: "metal", label: "Metal" },
  { value: "paper", label: "Paper" },
  { value: "ewaste", label: "E-Waste" },
  { value: "glass", label: "Glass" },
  { value: "others", label: "Others" },
];

export const formatScrapTypeLabel = (scrapType: string) =>
  scrapTypeLabels[String(scrapType || "").toLowerCase()] || "Mixed Scrap";

export const formatRequestStatusLabel = (status: ScrapRequestStatus) =>
  statusLabels[status] || "Pending";

export const formatHistoryStatusLabel = (status: ScrapRequestStatus) =>
  status === "completed" ? "Completed" : "Pending";

export const isCompletedRequest = (status: ScrapRequestStatus) => status === "completed";

export const getRequestAmount = (request: ScrapRequest) => {
  const completedAmount = Number(request.collectedAmount || 0);
  const estimatedAmount = Number(request.estimatedPrice || 0);
  return isCompletedRequest(request.status) && completedAmount > 0 ? completedAmount : estimatedAmount;
};

export const getRequestWeight = (request: ScrapRequest) => {
  const collectedWeight = Number(request.collectedWeightKg || 0);
  const estimatedWeight = Number(request.estimatedWeightKg || 0);
  return isCompletedRequest(request.status) && collectedWeight > 0 ? collectedWeight : estimatedWeight;
};

export const getRequestPickupDate = (request: ScrapRequest) =>
  request.completedAt || request.preferredPickupDateTime || request.createdAt;

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

