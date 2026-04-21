// ============================================
// Customer-side API adapter.
// Translates the original UI's API surface (string ids, "OrderStatus", etc.)
// into calls against the real /lib/api endpoints, mapping shapes both ways.
// ============================================

import {
  menuApi, ordersApi, settingsApi, reviewsApi,
  type MenuCategory, type MenuProductListItem, type MenuProductDetail,
  type OrderListItem, type OrderDetail,
} from '@/lib/api';
import type { Category, MenuItem, Order, OrderStatus, OrderType, CartItem, DeliveryAddress } from './types';

// ---------- shape adapters ----------

function adaptCategory(c: MenuCategory, sortOrder: number): Category {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug ?? `cat-${c.id}`,
    image: c.image ?? undefined,
    description: c.description ?? undefined,
    sortOrder,
    isActive: true,
  };
}

function adaptMenuItem(p: MenuProductListItem | MenuProductDetail): MenuItem {
  const detail = (p as MenuProductDetail).product_details;
  const description = (
    detail
      ? detail.replace(/<[^>]+>/g, '').trim().slice(0, 200)
      : (p.short_details ?? '')
  ) || '';
  // All products returned by the API are already filtered by hide=0, so they're
  // menu-visible. Stock validation happens server-side at checkout, not here —
  // SMA runs with overselling=1 so most products have negative stock historically.
  return {
    id: String(p.id),
    categoryId: String(p.category_id),
    name: p.name.trim(),
    description,
    price: p.price,
    image: p.image ?? undefined,
    isAvailable: true,
    tags: p.featured ? ['bestseller'] : [],
    prepTimeMinutes: 20, // backend doesn't track per-item; use the global ASAP prep window
    nameBn: p.name_bn,
    avgRating: p.avg_rating,
    reviewCount: p.review_count,
  };
}

function adaptStatus(s: OrderListItem['online_status']): OrderStatus {
  switch (s) {
    case 'placed':    return 'pending';
    case 'preparing': return 'preparing';
    case 'ready':     return 'ready';
    case 'completed': return 'completed';
    case 'cancelled': return 'declined';
    case 'rejected':  return 'declined';
    default: return 'pending';
  }
}

function adaptOrder(o: OrderListItem | OrderDetail, customerName = 'You'): Order {
  const detail = 'items' in o ? o : null;
  return {
    id: String(o.id),
    orderNumber: o.reference_no,
    customerId: 'me',
    customerName,
    orderType: 'takeaway', // pickup channel only on the SMA backend
    items: detail
      ? detail.items.map((it, i) => ({
          id: `oi-${o.id}-${i}`,
          menuItemId: String(it.product_id),
          menuItemName: it.product_name,
          quantity: it.quantity,
          unitPrice: it.unit_price,
          notes: it.note ?? undefined,
        }))
      : [],
    status: adaptStatus(o.online_status),
    subtotal: o.total,    // backend returns final total incl. service charge
    total: o.total,
    notes: undefined,
    createdAt: o.date,
    updatedAt: o.date,
    readyAt:     o.online_status === 'ready' || o.online_status === 'completed' ? o.date : undefined,
    completedAt: o.online_status === 'completed' ? o.date : undefined,
    declineReason: detail?.cancel_reason ?? undefined,
  };
}

// ---------- adapter API surface (original signatures) ----------

let _categoriesCache: Category[] | null = null;
let _menuCache: MenuItem[] | null = null;

export async function getCategories(): Promise<Category[]> {
  if (_categoriesCache) return _categoriesCache;
  const cats = await menuApi.categories();
  _categoriesCache = cats.map((c, i) => adaptCategory(c, i));
  return _categoriesCache;
}

export async function getAllCategories(): Promise<Category[]> {
  return getCategories();
}

export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  if (!_menuCache) {
    const res = await menuApi.products({ page: 1, page_size: 200 });
    _menuCache = res.items.map(adaptMenuItem);
  }
  return categoryId ? _menuCache.filter(i => i.categoryId === categoryId) : _menuCache;
}

export async function getMenuItem(id: string): Promise<MenuItem | undefined> {
  const cached = _menuCache?.find(i => i.id === id);
  if (cached) return cached;
  try {
    const detail = await menuApi.product(Number(id));
    return adaptMenuItem(detail);
  } catch {
    return undefined;
  }
}

export function refreshMenuCache() {
  _menuCache = null;
  _categoriesCache = null;
}

export async function getOrders(_status?: OrderStatus): Promise<Order[]> {
  const res = await ordersApi.list(1, 50);
  return res.items.map(o => adaptOrder(o));
}

export async function getCustomerOrders(_customerId: string): Promise<Order[]> {
  return getOrders();
}

export async function getOrder(id: string): Promise<Order | undefined> {
  try {
    const detail = await ordersApi.get(Number(id));
    return adaptOrder(detail);
  } catch {
    return undefined;
  }
}

/**
 * Original signature, but takeaway/delivery/dine-in is collapsed to "pickup ASAP"
 * for the backend (only fulfillment mode currently supported).
 *
 * Returns the adapted Order so the existing UI flow keeps working.
 */
export async function createOrder(
  customerId: string,
  customerName: string,
  items: CartItem[],
  options?: {
    orderType?: OrderType;
    tableNumber?: string;
    deliveryAddress?: DeliveryAddress;
    notes?: string;
  },
): Promise<Order> {
  const placed = await ordersApi.place({
    items: items.map(ci => ({
      product_id: Number(ci.menuItem.id),
      quantity: ci.quantity,
      note: ci.notes,
    })),
    pickup: { is_asap: true },
    note: options?.notes,
  });
  // Pull the full record so we can return a fully-shaped Order
  const detail = await ordersApi.get(placed.sale_id);
  return adaptOrder(detail, customerName);
}

// Public open/closed banner used by MenuPage if it wants it
export async function getPublicSettings() {
  return settingsApi.public();
}

// Reviews
export async function getProductReviews(productId: string, page = 1) {
  const res = await menuApi.productReviews(Number(productId), page, 20);
  return res;
}

export async function getReviewableItems(orderId: string) {
  const res = await ordersApi.reviewable(Number(orderId));
  return res.items;
}

export async function submitReview(data: { product_id: number; sale_id: number; rating: number; comment?: string }) {
  return reviewsApi.create(data);
}

export { reviewsApi };
