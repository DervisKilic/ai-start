// User types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'seller';
  createdAt?: string;
  updatedAt?: string;
}

// Contact types
export interface Contact {
  id: number;
  sellerId: number;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactData {
  name: string;
  email?: string | null;
  phone: string;
  company?: string | null;
}

export interface UpdateContactData {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
}

// Seller types (for admin)
export interface Seller {
  id: number;
  email: string;
  name: string;
  role: 'seller';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSellerData {
  email: string;
  password: string;
  name: string;
}

export interface UpdateSellerData {
  email?: string | null;
  password?: string | null;
  name?: string | null;
}

// Interaction types
export interface Interaction {
  id: number;
  contactId: number;
  type: 'call' | 'meeting' | 'email';
  dateTime: string;
  notes: string | null;
  followUpNeeded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInteractionData {
  type: 'call' | 'meeting' | 'email';
  dateTime: string;
  notes?: string | null;
  followUpNeeded?: boolean;
}

export interface UpdateInteractionData {
  type?: 'call' | 'meeting' | 'email';
  dateTime?: string;
  notes?: string | null;
  followUpNeeded?: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

