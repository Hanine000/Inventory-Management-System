// ─── App Info ─────────────────────────────────────────────────────────────────
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Lumière'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ─── React Query Defaults ─────────────────────────────────────────────────────
export const QUERY_STALE_TIME = 1000 * 60 * 5        // 5 minutes
export const QUERY_CACHE_TIME = 1000 * 60 * 10       // 10 minutes

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Centralising query keys prevents typos and makes cache invalidation easy.
export const QUERY_KEYS = {
  AUTH:       'auth',
  PROFILE:    'profile',
  PRODUCTS:   'products',
  CATEGORIES: 'categories',
  BRANDS:     'brands',
  SALES:      'sales',
  ORDERS:     'orders',
  SUPPLIERS:  'suppliers',
  DASHBOARD:  'dashboard',
  AI:         'ai',
}

// ─── Route Paths ──────────────────────────────────────────────────────────────
export const ROUTES = {
  LOGIN:      '/login',
  DASHBOARD:  '/',
  PRODUCTS:   '/products',
  CATEGORIES: '/categories',
  BRANDS:     '/brands',
  SALES:      '/sales',
  ORDERS:     '/orders',
  SUPPLIERS:  '/suppliers',
  NOT_FOUND:  '*',
}

// ─── HTTP Status Codes ────────────────────────────────────────────────────────
export const HTTP_STATUS = {
  OK:           200,
  CREATED:      201,
  BAD_REQUEST:  400,
  UNAUTHORIZED: 401,
  FORBIDDEN:    403,
  NOT_FOUND:    404,
  SERVER_ERROR: 500,
}

// ─── Local Storage Keys ───────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN:        'lum_token',
  REFRESH_TOKEN:'lum_refresh',
  USER:         'lum_user',
}

// ─── Product Categories (seed / fallback) ────────────────────────────────────
export const PRODUCT_TYPES = ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Accessories']

// ─── Order / Sale Status ──────────────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  SHIPPED:   'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const SALE_STATUS = {
  COMPLETED: 'completed',
  REFUNDED:  'refunded',
  PENDING:   'pending',
}