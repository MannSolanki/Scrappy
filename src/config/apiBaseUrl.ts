const explicitApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

const normalizeApiBase = (value: string) =>
  value
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');

// In production, default to same-origin `/api` unless an explicit backend URL is provided.
const fallbackApiUrl = import.meta.env.PROD ? '/api' : '';

export const API_BASE_URL = explicitApiUrl
  ? normalizeApiBase(explicitApiUrl)
  : fallbackApiUrl;
