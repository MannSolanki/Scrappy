const explicitApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

// In production, default to same-origin `/api` unless an explicit backend URL is provided.
const fallbackApiUrl = import.meta.env.PROD ? '/api' : 'https://your-backend-url.com';

export const API_BASE_URL = explicitApiUrl || fallbackApiUrl;
