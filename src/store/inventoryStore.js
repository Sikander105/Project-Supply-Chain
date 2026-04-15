import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getInventoryValue, getLowStockProducts, getTotalStockUnits } from '../utils'
import { useAuth } from './authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://supplyos.app/api'

const API_ENTITY_MAP = {
  products: 'products',
  vendors: 'vendors',
  warehouses: 'warehouses',
  shipments: 'shipments',
  purchaseOrders: 'purchase-orders',
  purchase_orders: 'purchase-orders',
  'purchase-orders': 'purchase-orders',
}

const STORE_ENTITY_MAP = {
  products: 'products',
  vendors: 'vendors',
  warehouses: 'warehouses',
  shipments: 'shipments',
  purchaseOrders: 'purchaseOrders',
  purchase_orders: 'purchaseOrders',
  'purchase-orders': 'purchaseOrders',
}

function toApiEntity(entity) {
  return API_ENTITY_MAP[entity] || entity
}

function toStoreEntity(entity) {
  return STORE_ENTITY_MAP[entity] || entity
}

const InventoryContext = createContext(null)

export function InventoryProvider({ children }) {
  const { token } = useAuth()
  const [state, setState] = useState({
    products: [],
    vendors: [],
    warehouses: [],
    purchaseOrders: [],
    shipments: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  )

  const apiRequest = useCallback(
    async (path, options = {}) => {
      if (!token) throw new Error('Not authenticated')

      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...authHeaders,
        },
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.detail || `Request failed (${response.status})`)
      }
      return data
    },
    [token, authHeaders],
  )

  useEffect(() => {
    if (!token) {
      setState({
        products: [],
        vendors: [],
        warehouses: [],
        purchaseOrders: [],
        shipments: [],
      })
      setIsLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      try {
        const [products, vendors, warehouses, purchaseOrders, shipments] = await Promise.all([
          apiRequest('/products/'),
          apiRequest('/vendors/'),
          apiRequest('/warehouses/'),
          apiRequest('/purchase-orders/'),
          apiRequest('/shipments/'),
        ])
        if (cancelled) return
        setState({ products, vendors, warehouses, purchaseOrders, shipments })
      } catch (e) {
        console.error('Inventory load failed:', e)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token, apiRequest])

  const addItem = useCallback(
    async (entity, payload) => {
      const apiEntity = toApiEntity(entity)
      const storeEntity = toStoreEntity(entity)

      const result = await apiRequest(`/${apiEntity}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setState((previous) => ({
        ...previous,
        [storeEntity]: [result, ...(previous[storeEntity] || [])],
      }))
      return result
    },
    [apiRequest],
  )

  const updateItem = useCallback(
    async (entity, id, payload) => {
      const apiEntity = toApiEntity(entity)
      const storeEntity = toStoreEntity(entity)

      const result = await apiRequest(`/${apiEntity}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setState((previous) => ({
        ...previous,
        [storeEntity]: (previous[storeEntity] || []).map((item) =>
          item.id === id ? result : item,
        ),
      }))
      return result
    },
    [apiRequest],
  )

  const removeItem = useCallback(
    async (entity, id) => {
      const apiEntity = toApiEntity(entity)
      const storeEntity = toStoreEntity(entity)

      await apiRequest(`/${apiEntity}/${id}`, { method: 'DELETE' })

      setState((previous) => ({
        ...previous,
        [storeEntity]: (previous[storeEntity] || []).filter((item) => item.id !== id),
      }))
      return true
    },
    [apiRequest],
  )

  const lookups = useMemo(() => {
    const productById = Object.fromEntries(state.products.map((x) => [x.id, x]))
    const vendorById = Object.fromEntries(state.vendors.map((x) => [x.id, x]))
    const warehouseById = Object.fromEntries(state.warehouses.map((x) => [x.id, x]))
    return { productById, vendorById, warehouseById }
  }, [state.products, state.vendors, state.warehouses])

  const summaries = useMemo(() => {
    const pendingPurchaseOrders = state.purchaseOrders.filter(
      (order) => order.status === 'Pending',
    ).length

    return {
      totalProducts: state.products.length,
      totalVendors: state.vendors.length,
      totalWarehouses: state.warehouses.length,
      totalPurchaseOrders: state.purchaseOrders.length,
      totalShipments: state.shipments.length,
      pendingPurchaseOrders,
      totalStockUnits: getTotalStockUnits(state.products),
      totalInventoryValue: getInventoryValue(state.products),
      lowStockItems: getLowStockProducts(state.products).length,
    }
  }, [state.products, state.vendors, state.warehouses, state.purchaseOrders, state.shipments])

  const value = useMemo(
    () => ({
      ...state,
      isLoading,
      summaries,
      lookups,
      addItem,
      updateItem,
      removeItem,
    }),
    [state, isLoading, summaries, lookups, addItem, updateItem, removeItem],
  )

  return createElement(InventoryContext.Provider, { value }, children)
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) throw new Error('useInventory must be used inside InventoryProvider')
  return context
}