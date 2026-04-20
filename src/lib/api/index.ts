// Typed API methods for the customer online ordering channel.
// All requests go through apiClient which handles JWT attach + auto-refresh.

import { apiRequest, tokenStore } from '@/lib/apiClient';

// ============================================
// Response types
// ============================================

export interface AuthCustomer {
  id: number;
  email: string;
  full_name: string;
  phone: string;
}

export interface LoginResponse {
  access_token: string;
  access_expires_at: string;
  refresh_token: string;
  customer: AuthCustomer;
}

export interface PublicSettings {
  enabled: boolean;
  is_open_now: boolean;
  next_open_at: string | null;
  today: { day: number; open: string; close: string; closed: boolean } | null;
  hours: Array<{ day: number; open: string; close: string; closed: boolean }> | null;
  pickup_outlet: { id: number; name: string; address: string | null; phone: string | null } | null;
  min_prep_minutes: number;
  max_scheduled_days_ahead: number;
  customer_cancel_window_minutes: number;
}

export interface MenuCategory {
  id: number;
  name: string;
  slug: string | null;
  image: string | null;
  parent_id: number | null;
  description: string | null;
}

export interface MenuProductListItem {
  id: number;
  code: string;
  name: string;
  name_bn: string | null;
  category_id: number;
  image: string | null;
  price: number;
  stock: number | null;
  featured: boolean;
  short_details: string | null;
  slug: string | null;
  avg_rating: number | null;
  review_count: number;
}

export interface MenuProductDetail extends MenuProductListItem {
  thumbnail: string | null;
  gallery: string[];
  product_details: string | null;
  variants: Array<{ id: number; name: string; cost: number | null; price: number | null; quantity: number | null }>;
  combo_items: Array<{ item_code: string; quantity: number; unit_price: number }>;
  my_review: { id: number; rating: number; comment: string | null; status: string; created_at: string; edited_at: string | null } | null;
}

export interface ReviewListItem {
  id: number;
  rating: number;
  comment: string | null;
  customer_name: string;
  created_at: string;
  edited_at: string | null;
}

export interface MyReviewListItem {
  id: number;
  product_id: number;
  product_name: string | null;
  product_image: string | null;
  rating: number;
  comment: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  edited_at: string | null;
}

export interface OrderListItem {
  id: number;
  reference_no: string;
  date: string;
  online_status: 'placed' | 'ready' | 'completed' | 'cancelled' | 'rejected';
  pickup_time: string;
  is_asap: boolean;
  total_items: number;
  total: number;
  cancellation_requested_at: string | null;
}

export interface OrderDetail extends OrderListItem {
  items: Array<{ product_id: number; product_code: string; product_name: string; quantity: number; unit_price: number; subtotal: number; note: string | null }>;
  timeline: Array<{ from_status: string | null; to_status: string; actor_type: string; created_at: string; reason: string | null }>;
  cancel_reason: string | null;
}

export interface ReviewableItem {
  product_id: number;
  product_code: string;
  product_name: string;
  image: string | null;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ============================================
// Auth
// ============================================

export const authApi = {
  signup: (data: { email: string; password: string; full_name: string; phone: string }) =>
    apiRequest<{ status: string; message: string }>('/auth/signup', { body: data, noAuth: true }),

  verify: (token: string) =>
    apiRequest<{ status: string }>('/auth/verify', { query: { token }, noAuth: true }),

  resendVerification: (email: string) =>
    apiRequest<{ status: string }>('/auth/resend-verification', { body: { email }, noAuth: true }),

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await apiRequest<LoginResponse>('/auth/login', { body: { email, password }, noAuth: true });
    tokenStore.setTokens(res.access_token, res.refresh_token, res.access_expires_at);
    return res;
  },

  forgotPassword: (email: string) =>
    apiRequest<{ status: string }>('/auth/forgot-password', { body: { email }, noAuth: true }),

  resetPassword: (token: string, new_password: string) =>
    apiRequest<{ status: string }>('/auth/reset-password', { body: { token, new_password }, noAuth: true }),

  logout: async () => {
    const refresh = tokenStore.getRefresh();
    try { await apiRequest('/auth/logout', { method: 'POST', body: { refresh_token: refresh } }); }
    catch { /* even if server fails, drop tokens locally */ }
    tokenStore.clear();
  },
};

// ============================================
// Profile
// ============================================

export const profileApi = {
  changePassword: (old_password: string, new_password: string) =>
    apiRequest<{ status: string }>('/profile/change-password', { body: { old_password, new_password } }),
};

// ============================================
// Settings (public)
// ============================================

export const settingsApi = {
  public: () => apiRequest<PublicSettings>('/settings/public', { noAuth: true }),
};

// ============================================
// Menu
// ============================================

export const menuApi = {
  categories: () => apiRequest<MenuCategory[]>('/menu/categories', { noAuth: true }),
  products: (filters: { category_id?: number; search?: string; featured?: boolean; page?: number; page_size?: number } = {}) =>
    apiRequest<PageResult<MenuProductListItem>>('/menu/products', {
      query: {
        category_id: filters.category_id,
        search: filters.search,
        featured: filters.featured ? 1 : undefined,
        page: filters.page,
        page_size: filters.page_size,
      },
      noAuth: true,
    }),
  product: (id: number) => apiRequest<MenuProductDetail>(`/menu/products/${id}`),
  productReviews: (id: number, page = 1, page_size = 20) =>
    apiRequest<PageResult<ReviewListItem>>(`/menu/products/${id}/reviews`, { query: { page, page_size }, noAuth: true }),
};

// ============================================
// Orders
// ============================================

export interface PlaceOrderInput {
  items: Array<{ product_id: number; quantity: number; variant_id?: number; note?: string }>;
  pickup: { is_asap: true } | { is_asap?: false; scheduled_at: string };
  note?: string;
}

export interface PlaceOrderResponse {
  sale_id: number;
  reference_no: string;
  online_status: string;
  pickup_time: string;
  is_asap: boolean;
  grand_total: number;
}

export const ordersApi = {
  place: (input: PlaceOrderInput) => apiRequest<PlaceOrderResponse>('/orders', { body: input }),
  list: (page = 1, page_size = 20) =>
    apiRequest<PageResult<OrderListItem>>('/orders', { query: { page, page_size } }),
  get: (id: number) => apiRequest<OrderDetail>(`/orders/${id}`),
  cancel: (id: number, reason?: string) =>
    apiRequest<{ status: string }>(`/orders/${id}/cancel`, { body: reason ? { reason } : {} }),
  requestCancellation: (id: number, reason?: string) =>
    apiRequest<{ status: string }>(`/orders/${id}/request-cancellation`, { body: reason ? { reason } : {} }),
  reviewable: (id: number) => apiRequest<{ items: ReviewableItem[] }>(`/orders/${id}/reviewable`),
};

// ============================================
// Reviews
// ============================================

export const reviewsApi = {
  create: (data: { product_id: number; sale_id: number; rating: number; comment?: string }) =>
    apiRequest<{ id: number; product_id: number; rating: number; comment: string | null; status: string }>('/reviews', { body: data }),
  mine: (page = 1, page_size = 20) =>
    apiRequest<PageResult<MyReviewListItem>>('/reviews/mine', { query: { page, page_size } }),
  edit: (id: number, data: { rating?: number; comment?: string | null }) =>
    apiRequest<{ id: number; rating: number; comment: string | null; status: string; edited_at: string }>(`/reviews/${id}`, { method: 'PATCH', body: data }),
  remove: (id: number) =>
    apiRequest<{ status: string }>(`/reviews/${id}`, { method: 'DELETE' }),
};
