import { AdminUser, ScrapRequest } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getStoredToken = (): string => {
  const directToken = localStorage.getItem('token');
  if (directToken) {
    return directToken;
  }

  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return '';
    }

    const parsedUser = JSON.parse(storedUser) as { token?: string };
    return parsedUser.token || '';
  } catch {
    return '';
  }
};

const buildHeaders = (): HeadersInit => {
  const token = getStoredToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const toErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || 'Request failed';
  } catch {
    return 'Request failed';
  }
};

export const fetchUsers = async (): Promise<AdminUser[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }

  const data = (await response.json()) as { users?: AdminUser[] };
  return data.users || [];
};

export const fetchScrapRequests = async (): Promise<ScrapRequest[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/scrap-requests`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }

  const data = (await response.json()) as { requests?: ScrapRequest[] };
  return data.requests || [];
};

export const updateScrapRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected'
): Promise<ScrapRequest> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/scrap-requests/${requestId}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }

  const data = (await response.json()) as { updatedRequest?: ScrapRequest };

  if (!data.updatedRequest) {
    throw new Error('Missing updated request in response');
  }

  return data.updatedRequest;
};
