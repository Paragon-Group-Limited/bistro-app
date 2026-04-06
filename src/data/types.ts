// ============================================
// Bistro App — Type Definitions
// All types used across the app live here.
// When connecting to real backend, these stay.
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
  tags: string[]; // e.g., "spicy", "vegetarian", "bestseller", "new"
  prepTimeMinutes: number;
  calories?: number;
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

export type OrderStatus =
  | 'pending'      // Just placed
  | 'accepted'     // Kitchen accepted
  | 'preparing'    // Being prepared
  | 'ready'        // Ready for pickup/serving
  | 'completed'    // Served/picked up
  | 'declined';    // Kitchen declined

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
  orderNumber: string; // e.g., "#042"
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

export type StaffRole = 'admin' | 'manager' | 'kitchen' | 'waiter';

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

// ============================================
// Settings & Configuration Types
// ============================================

export interface TaxRate {
  id: string;
  code: string;
  name: string;
  rate: number;       // percentage, e.g. 15 means 15%
  type: 'inclusive' | 'exclusive';
  isActive: boolean;
}

export interface Biller {
  id: string;
  companyName: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  taxNumber?: string;
  vatNumber?: string;
  logo?: string;
  isDefault: boolean;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;   // relative to base currency
  isDefault: boolean;
  isActive: boolean;
}

export type PermissionModule =
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'tables'
  | 'customers'
  | 'team'
  | 'reports'
  | 'expenses'
  | 'inventory'
  | 'suppliers'
  | 'purchases'
  | 'quotes'
  | 'gift-cards'
  | 'promotions'
  | 'calendar'
  | 'returns'
  | 'settings';

export interface Permission {
  module: PermissionModule;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface RolePermissions {
  role: StaffRole;
  permissions: Permission[];
}

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  defaultCurrencyId: string;
  defaultTaxRateId: string;
  orderPrefix: string;          // e.g. "#"
  enableDelivery: boolean;
  enableTableOrdering: boolean;
  enableOnlinePayment: boolean;
}

// ============================================
// Table Management Types
// ============================================

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  floor: string;        // e.g. 'Ground', 'Rooftop'
  currentOrderId?: string;
}

export interface Reservation {
  id: string;
  tableId: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  date: string;
  time: string;
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

// ============================================
// Inventory Types
// ============================================

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  unit: string;          // e.g. 'kg', 'pcs', 'litre'
  reorderLevel: number;
  costPrice: number;
  warehouseId: string;
  warehouseName: string;
  lastRestockedAt?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface StockAdjustment {
  id: string;
  inventoryItemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

// ============================================
// Supplier Types
// ============================================

export interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// Purchase Order Types
// ============================================

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  referenceNo: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  subtotal: number;
  notes?: string;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  createdBy: string;
  createdAt: string;
}

// ============================================
// Promotions Types
// ============================================

export type PromoType = 'percentage' | 'fixed' | 'bogo';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  type: PromoType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// Returns Types
// ============================================

export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'refunded';

export interface Return {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  items: { menuItemName: string; quantity: number; unitPrice: number }[];
  reason: string;
  status: ReturnStatus;
  refundAmount: number;
  processedBy?: string;
  createdAt: string;
  processedAt?: string;
}

// ============================================
// Reports & Expenses Types
// ============================================

export interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface DailySalesReport {
  date: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
}

// ============================================
// Gift Card Types
// ============================================

export type GiftCardStatus = 'active' | 'used' | 'inactive' | 'expired';

export interface GiftCard {
  id: string;
  cardNumber: string;
  initialBalance: number;
  currentBalance: number;
  status: GiftCardStatus;
  customerId?: string;
  customerName?: string;
  expiresAt?: string;
  issuedBy: string;
  createdAt: string;
}

export interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  type: 'issue' | 'redeem' | 'topup';
  amount: number;
  balanceAfter: number;
  orderId?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

// ============================================
// Quotes Types
// ============================================

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface QuoteItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  referenceNo: string;
  customerName: string;
  customerPhone?: string;
  items: QuoteItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: QuoteStatus;
  validUntil: string;
  notes?: string;
  convertedToOrderId?: string;
  createdBy: string;
  createdAt: string;
}

// ============================================
// Calendar Types
// ============================================

export type CalendarEventType = 'shift' | 'meeting' | 'reservation' | 'reminder' | 'holiday' | 'custom';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color: string;
  staffId?: string;
  staffName?: string;
  createdBy: string;
  createdAt: string;
}

export type NotificationType = 'order' | 'inventory' | 'system' | 'staff';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
