export const PRODUCT_STOCK_STATUS = {
  inStock: 'In Stock',
  lowStock: 'Low Stock',
  outOfStock: 'Out of Stock',
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0)
}

export function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getProductStatus(product) {
  const stock = Number(product.stock) || 0
  const reorderLevel = Number(product.reorderLevel) || 0
  if (stock <= 0) return PRODUCT_STOCK_STATUS.outOfStock
  if (stock <= reorderLevel) return PRODUCT_STOCK_STATUS.lowStock
  return PRODUCT_STOCK_STATUS.inStock
}

export function getTotalStockUnits(products) {
  return products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0)
}

export function getInventoryValue(products) {
  return products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0) * (Number(product.price) || 0),
    0,
  )
}

export function getLowStockProducts(products) {
  return products.filter(
    (product) =>
      getProductStatus(product) === PRODUCT_STOCK_STATUS.lowStock ||
      getProductStatus(product) === PRODUCT_STOCK_STATUS.outOfStock,
  )
}

export function groupByCategory(products) {
  const grouped = {}
  for (const product of products) {
    const category = product.category || 'Uncategorized'
    grouped[category] = (grouped[category] || 0) + 1
  }
  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }))
}

export function summarizePurchaseOrderStatuses(purchaseOrders) {
  const grouped = {}
  for (const order of purchaseOrders) {
    const status = order.status || 'Unknown'
    grouped[status] = (grouped[status] || 0) + 1
  }
  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }))
}

export function getStockLevelOverview(products) {
  return [
    {
      name: PRODUCT_STOCK_STATUS.inStock,
      value: products.filter(
        (item) => getProductStatus(item) === PRODUCT_STOCK_STATUS.inStock,
      ).length,
    },
    {
      name: PRODUCT_STOCK_STATUS.lowStock,
      value: products.filter(
        (item) => getProductStatus(item) === PRODUCT_STOCK_STATUS.lowStock,
      ).length,
    },
    {
      name: PRODUCT_STOCK_STATUS.outOfStock,
      value: products.filter(
        (item) => getProductStatus(item) === PRODUCT_STOCK_STATUS.outOfStock,
      ).length,
    },
  ]
}

export function getInventoryValueByCategory(products) {
  const grouped = {}
  for (const product of products) {
    const category = product.category || 'Uncategorized'
    const value = (Number(product.stock) || 0) * (Number(product.price) || 0)
    grouped[category] = (grouped[category] || 0) + value
  }
  return Object.entries(grouped).map(([name, value]) => ({ name, value }))
}

export function getProductsByStockLevel(products) {
  return [
    {
      name: PRODUCT_STOCK_STATUS.inStock,
      value: products.filter(
        (product) => getProductStatus(product) === PRODUCT_STOCK_STATUS.inStock,
      ).length,
    },
    {
      name: PRODUCT_STOCK_STATUS.lowStock,
      value: products.filter(
        (product) => getProductStatus(product) === PRODUCT_STOCK_STATUS.lowStock,
      ).length,
    },
    {
      name: PRODUCT_STOCK_STATUS.outOfStock,
      value: products.filter(
        (product) => getProductStatus(product) === PRODUCT_STOCK_STATUS.outOfStock,
      ).length,
    },
  ]
}

export function getPurchaseOrdersByStatus(purchaseOrders) {
  return summarizePurchaseOrderStatuses(purchaseOrders)
}

console.log("app started");