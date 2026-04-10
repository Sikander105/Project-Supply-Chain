import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getInventoryValue, getLowStockProducts, getTotalStockUnits } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const API_ENTITY_MAP = {
  products: 'products',
  vendors: 'vendors',
  warehouses: 'warehouses',
  shipments: 'shipments',
  purchaseOrders: 'purchase-orders',
  purchase_orders: 'purchase-orders',
  'purchase-orders': 'purchase-orders',
}

function toApiEntity(entity) {
  return API_ENTITY_MAP[entity] || entity
}

const InventoryContext = createContext(null)

async function fetchFromApi(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error)
    return null
  }
}

async function createItemApi(entity, payload) {
  const apiEntity = toApiEntity(entity)
  const response = await fetch(`${API_BASE_URL}/${apiEntity}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return await response.json()
}

async function updateItemApi(entity, id, payload) {
  const apiEntity = toApiEntity(entity)
  const response = await fetch(`${API_BASE_URL}/${apiEntity}/${id}`, {
    method: 'PATCH', // not PUT
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return await response.json()
}

async function deleteItemApi(entity, id) {
  const apiEntity = toApiEntity(entity)
  const response = await fetch(`${API_BASE_URL}/${apiEntity}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return true
}

export function InventoryProvider({ children }) {
  const [state, setState] = useState({
    products: [],
    vendors: [],
    warehouses: [],
    purchaseOrders: [],
    shipments: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true)
      const [products, vendors, warehouses, purchaseOrders, shipments] = await Promise.all([
        fetchFromApi('/products/'),
        fetchFromApi('/vendors/'),
        fetchFromApi('/warehouses/'),
        fetchFromApi('/purchase-orders/'),
        fetchFromApi('/shipments/'),
      ])

      setState({
        products: Array.isArray(products) ? products : [],
        vendors: Array.isArray(vendors) ? vendors : [],
        warehouses: Array.isArray(warehouses) ? warehouses : [],
        purchaseOrders: Array.isArray(purchaseOrders) ? purchaseOrders : [],
        shipments: Array.isArray(shipments) ? shipments : [],
      })
      setIsLoading(false)
    }

    loadAllData()
  }, [])

  const addItem = useCallback(
    async (entity, payload) => {
      const result = await createItemApi(entity, payload)
      if (result) {
        setState((previous) => ({
          ...previous,
          [entity]: [result, ...previous[entity]],
        }))
        return result
      }
      return null
    },
    [],
  )

  const updateItem = useCallback(
    async (entity, id, payload) => {
      const result = await updateItemApi(entity, id, payload)
      if (result) {
        setState((previous) => ({
          ...previous,
          [entity]: previous[entity].map((item) =>
            item.id === id ? result : item,
          ),
        }))
        return result
      }
      return null
    },
    [],
  )

  const removeItem = useCallback(
    async (entity, id) => {
      const success = await deleteItemApi(entity, id)
      if (success) {
        setState((previous) => ({
          ...previous,
          [entity]: previous[entity].filter((item) => item.id !== id),
        }))
      }
      return success
    },
    [],
  )

  const lookups = useMemo(() => {
    const productById = Object.fromEntries(
      state.products.map((product) => [product.id, product]),
    )
    const vendorById = Object.fromEntries(
      state.vendors.map((vendor) => [vendor.id, vendor]),
    )
    const warehouseById = Object.fromEntries(
      state.warehouses.map((warehouse) => [warehouse.id, warehouse]),
    )

    return { productById, vendorById, warehouseById }
  }, [state.products, state.vendors, state.warehouses])

  const summaries = useMemo(() => {
    const totalProducts = state.products.length
    const totalVendors = state.vendors.length
    const totalWarehouses = state.warehouses.length
    const totalPurchaseOrders = state.purchaseOrders.length
    const totalShipments = state.shipments.length
    const pendingPurchaseOrders = state.purchaseOrders.filter(
      (order) => order.status === 'Pending',
    ).length
    const totalStockUnits = getTotalStockUnits(state.products)
    const totalInventoryValue = getInventoryValue(state.products)
    const lowStockItems = getLowStockProducts(state.products).length

    return {
      totalProducts,
      totalVendors,
      totalWarehouses,
      totalPurchaseOrders,
      totalShipments,
      pendingPurchaseOrders,
      totalStockUnits,
      totalInventoryValue,
      lowStockItems,
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

  return React.createElement(InventoryContext.Provider, { value }, children)
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventory must be used inside InventoryProvider')
  }
  return context
}