export const PRODUCT_STOCK_STATUS = {
    OUT_OF_STOCK: 'Out of stock',
    LOW_STOCK: 'Low stock',
    IN_STOCK: 'In stock',
  }
  
  export function toNumber(value, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  
  export function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(toNumber(value))
  }
  
  export function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(toNumber(value))
  }
  
  export function formatDate(value) {
    if (!value) return '-'
  
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
  
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }
  
  export function getStockStatus(quantity, lowStockThreshold = 10) {
    const qty = toNumber(quantity)
  
    if (qty <= 0) return PRODUCT_STOCK_STATUS.OUT_OF_STOCK
    if (qty <= lowStockThreshold) return PRODUCT_STOCK_STATUS.LOW_STOCK
    return PRODUCT_STOCK_STATUS.IN_STOCK
  }
  
  export function sumBy(items, selector) {
    return (Array.isArray(items) ? items : []).reduce(
      (total, item) => total + toNumber(selector(item)),
      0,
    )
  }