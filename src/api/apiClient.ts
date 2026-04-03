import { API_BASE_URL } from "../config/apiBaseUrl";

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("scrappy_token");
  localStorage.removeItem("scrappy_user");
};

const redirectToLogin = () => {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

export const getStoredToken = () => {
  const directToken = localStorage.getItem("token");
  if (directToken) {
    return directToken;
  }

  const legacyToken = localStorage.getItem("scrappy_token");
  if (legacyToken) {
    return legacyToken;
  }

  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      return "";
    }

    const parsedUser = JSON.parse(rawUser) as { token?: string };
    return parsedUser?.token || "";
  } catch {
    return "";
  }
};

export const buildApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = async (path: string, options: ApiFetchOptions = {}) => {
  const { skipAuth = false, headers, body, method = "GET", ...rest } = options;
  const token = getStoredToken();
  const normalizedHeaders = new Headers(headers);
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (!skipAuth && !token) {
    console.warn(`[apiFetch] ${String(method).toUpperCase()} ${buildApiUrl(path)} token missing`);
    clearStoredAuth();
    redirectToLogin();
    throw new Error("Authentication token missing. Please log in again.");
  }

  if (!isFormData && !normalizedHeaders.has("Content-Type")) {
    normalizedHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth && token) {
    normalizedHeaders.set("Authorization", `Bearer ${token}`);
  }

  console.debug(`[apiFetch] ${String(method).toUpperCase()} ${buildApiUrl(path)} token:`, token ? `${token.slice(0, 12)}...` : "missing");

  const response = await fetch(buildApiUrl(path), {
    ...rest,
    method,
    headers: normalizedHeaders,
    body,
  });

  if (!skipAuth && response.status === 401) {
    console.warn(`[apiFetch] ${String(method).toUpperCase()} ${buildApiUrl(path)} returned 401`);
    clearStoredAuth();
    redirectToLogin();
  }

  return response;
};
