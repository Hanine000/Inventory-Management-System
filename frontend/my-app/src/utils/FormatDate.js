/**
 * Format a date string or Date object into a human-readable string.
 * All helpers are pure functions — no side effects.
 */

// ─── Core Formatter ───────────────────────────────────────────────────────────
/**
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return 'Invalid date'

  const defaults = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(d)
}

// ─── Preset Formats ───────────────────────────────────────────────────────────
/** e.g. "Apr 15, 2025" */
export const formatDateShort = (date) =>
  formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' })

/** e.g. "April 15, 2025" */
export const formatDateLong = (date) =>
  formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' })

/** e.g. "Apr 15, 2025, 3:45 PM" */
export const formatDateTime = (date) =>
  formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

/** e.g. "3:45 PM" */
export const formatTime = (date) =>
  formatDate(date, { hour: '2-digit', minute: '2-digit' })

// ─── Relative Time ────────────────────────────────────────────────────────────
/**
 * Returns a relative string like "2 hours ago" or "in 3 days".
 * Falls back to formatDateShort for dates older than 7 days.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelative(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return 'Invalid date'

  const diffMs = Date.now() - d.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr  = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr  / 24)

  if (Math.abs(diffSec) < 60)  return 'just now'
  if (Math.abs(diffMin) < 60)  return `${Math.abs(diffMin)}m ago`
  if (Math.abs(diffHr)  < 24)  return `${Math.abs(diffHr)}h ago`
  if (Math.abs(diffDay) < 7)   return `${Math.abs(diffDay)}d ago`

  return formatDateShort(date)
}

// ─── Currency ─────────────────────────────────────────────────────────────────
/**
 * Format a number as currency.
 * @param {number} amount
 * @param {string} [currency='USD']
 * @param {string} [locale='en-US']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  if (amount == null) return '—'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// ─── Number ───────────────────────────────────────────────────────────────────
/**
 * Format a number with locale-specific thousands separators.
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US').format(value)
}