import type { User } from '@/store';

export interface Product {
  id: number;
  name: string;
  nameEn?: string;
  price: number;
  coverImage?: string;
  images?: string[];
  category?: string;
  stock: number;
  description?: string;
  descriptionEn?: string;
  material?: string;
  materialEn?: string;
  dimensions?: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  // Optimistic-locking version reported by the server.
  version?: number | null;
}

export interface Article {
  id: number;
  title: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  summary?: string;
  summaryEn?: string;
  category?: string;
  author?: string;
  coverImage?: string;
  published: boolean;
  viewCount: number;
  createdAt: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id: number;
  orderNo: string;
  user?: User;
  totalAmount: number;
  paymentMethod?: string;
  status: OrderStatus;
  createdAt: string;
  items?: { id: number; productName: string; quantity: number; totalPrice: number }[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminUser extends User {
  enabled: boolean;
  createdAt: string;
}

// One file in the admin image library (the backend lists the upload folder).
export interface MediaAsset {
  src: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface TrafficStats {
  totalUsers: number;
  totalOrders: number;
  totalVisits: number;
  topPages: [string, number][];
  dailyVisits: [string, number][];
}
