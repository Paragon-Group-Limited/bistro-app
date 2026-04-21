// ============================================
// Customer-side types.
// Shape preserves the original UI's expectations; values are backed by the real
// SMA-based API in src/data/api.ts (which adapts from /lib/api).
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  tags: string[];
  prepTimeMinutes: number;
  calories?: number;
  // backend extras (unused by most components but available)
  nameBn?: string | null;
  avgRating?: number | null;
  reviewCount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
}

// Statuses kept loose so we can map online_status onto the original UI's labels.
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'declined';

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export type DeliveryStatus = 'pending' | 'assigned' | 'picked-up' | 'on-the-way' | 'delivered';

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  area: string;
  instructions?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: DeliveryAddress;
  deliveryFee?: number;
  deliveryStatus?: DeliveryStatus;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  total: number;
  declineReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  readyAt?: string;
  completedAt?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}
