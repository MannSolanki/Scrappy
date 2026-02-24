export type AdminSection = 'dashboard' | 'users' | 'requests' | 'support';

export interface AdminUser {
  _id?: string;
  id?: string;
  email: string;
  role: string;
}

export interface ScrapRequestUser {
  _id?: string;
  email?: string;
  name?: string;
}

export interface ScrapRequest {
  _id: string;
  id?: string;
  user?: ScrapRequestUser | string;
  status: string;
  estimatedWeightKg?: number;
  weightKg?: number;
  estimatedPrice?: number;
  totalPrice?: number;
  price?: number;
  createdAt?: string;
}
