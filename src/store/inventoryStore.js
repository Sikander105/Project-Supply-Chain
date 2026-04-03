import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getInventoryValue, getLowStockProducts, getTotalStockUnits } from '../utils'

const STORAGE_KEY = 'supply_chain_inventory_v1'

const ENTITY_CONFIG = {
  products: { prefix: 'PRD' },
  vendors: { prefix: 'VND' },
  warehouses: { prefix: 'WH' },
  purchaseOrders: { prefix: 'PO' },
  shipments: { prefix: 'SHP' },
}

const REQUIRED_COLLECTIONS = Object.keys(ENTITY_CONFIG)

const mockData = {
  products: [
    {
      id: 'PRD-1001',
      name: 'Industrial Safety Gloves',
      category: 'Safety',
      stock: 220,
      price: 12.5,
      reorderLevel: 60,
      warehouseId: 'WH-3001',
    },
    {
      id: 'PRD-1002',
      name: 'Hydraulic Pump Assembly',
      category: 'Mechanical',
      stock: 34,
      price: 480,
      reorderLevel: 40,
      warehouseId: 'WH-3002',
    },
    {
      id: 'PRD-1003',
      name: 'Packaging Carton - Large',
      category: 'Packaging',
      stock: 560,
      price: 2.2,
      reorderLevel: 120,
      warehouseId: 'WH-3003',
    },
    {
      id: 'PRD-1004',
      name: 'Copper Wire Roll 100m',
      category: 'Electrical',
      stock: 0,
      price: 95,
      reorderLevel: 25,
      warehouseId: 'WH-3002',
    },
    {
      id: 'PRD-1005',
      name: 'Valve Stem Kit',
      category: 'Mechanical',
      stock: 92,
      price: 68.4,
      reorderLevel: 30,
      warehouseId: 'WH-3001',
    },
    {
      id: 'PRD-1006',
      name: 'High-Vis Safety Vest',
      category: 'Safety',
      stock: 48,
      price: 18.75,
      reorderLevel: 55,
      warehouseId: 'WH-3003',
    },
    {
      id: 'PRD-1007',
      name: 'Insulation Foam Panel',
      category: 'Construction',
      stock: 155,
      price: 24.99,
      reorderLevel: 45,
      warehouseId: 'WH-3002',
    },
    {
      id: 'PRD-1008',
      name: 'Stainless Steel Fastener Set',
      category: 'Hardware',
      stock: 310,
      price: 9.6,
      reorderLevel: 80,
      warehouseId: 'WH-3001',
    },
  ],
  vendors: [
    {
      id: 'VND-2001',
      name: 'Atlas Industrial Supplies',
      contactPerson: 'Maya Franklin',
      phone: '+1 (555) 420-1101',
      email: 'maya@atlasindustrial.com',
    },
    {
      id: 'VND-2002',
      name: 'North Peak Components',
      contactPerson: 'Ethan Cole',
      phone: '+1 (555) 420-2202',
      email: 'ethan@northpeakco.com',
    },
    {
      id: 'VND-2003',
      name: 'PrimeLine Packaging',
      contactPerson: 'Sofia Nguyen',
      phone: '+1 (555) 420-3303',
      email: 'sofia@primelinepack.com',
    },
    {
      id: 'VND-2004',
      name: 'VoltEdge Electrical',
      contactPerson: 'Daniel Perez',
      phone: '+1 (555) 420-4404',
      email: 'daniel@voltedge.com',
    },
  ],
  warehouses: [
    {
      id: 'WH-3001',
      name: 'Central Distribution Hub',
      location: 'Chicago, IL',
      capacity: 3000,
      currentUsage: 1880,
    },
    {
      id: 'WH-3002',
      name: 'West Coast Fulfillment',
      location: 'Sacramento, CA',
      capacity: 2200,
      currentUsage: 1485,
    },
    {
      id: 'WH-3003',
      name: 'East Regional Storage',
      location: 'Newark, NJ',
      capacity: 1800,
      currentUsage: 1090,
    },
  ],
  purchaseOrders: [
    {
      id: 'PO-4001',
      vendorId: 'VND-2001',
      productId: 'PRD-1001',
      quantity: 150,
      status: 'Approved',
      createdDate: '2026-03-10',
    },
    {
      id: 'PO-4002',
      vendorId: 'VND-2002',
      productId: 'PRD-1002',
      quantity: 50,
      status: 'Pending',
      createdDate: '2026-03-17',
    },
    {
      id: 'PO-4003',
      vendorId: 'VND-2003',
      productId: 'PRD-1003',
      quantity: 300,
      status: 'Completed',
      createdDate: '2026-03-02',
    },
    {
      id: 'PO-4004',
      vendorId: 'VND-2004',
      productId: 'PRD-1004',
      quantity: 80,
      status: 'Cancelled',
      createdDate: '2026-02-26',
    },
  ],
  shipments: [
    {
      id: 'SHP-5001',
      productId: 'PRD-1001',
      warehouseId: 'WH-3001',
      quantity: 120,
      receivedDate: '2026-03-20',
      status: 'Received',
    },
    {
      id: 'SHP-5002',
      productId: 'PRD-1002',
      warehouseId: 'WH-3002',
      quantity: 35,
      receivedDate: '2026-03-28',
      status: 'In Transit',
    },
    {
      id: 'SHP-5003',
      productId: 'PRD-1006',
      warehouseId: 'WH-3003',
      quantity: 80,
      receivedDate: '2026-03-24',
      status: 'Received',
    },
    {
      id: 'SHP-5004',
      productId: 'PRD-1004',
      warehouseId: 'WH-3002',
      quantity: 40,
      receivedDate: '2026-03-29',
      status: 'Delayed',
    },
  ],
}

const InventoryContext = createContext(null)

function loadInventoryData() {
  if (typeof window === 'undefined') return null
  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function saveInventoryData(data) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function normalizeLoadedData(data) {
  if (!data || typeof data !== 'object') return null
  const normalized = {}
  for (const key of REQUIRED_COLLECTIONS) {
    normalized[key] = Array.isArray(data[key]) ? data[key] : mockData[key]
  }
  return normalized
}

function getNextId(collection, prefix) {
  let maxValue = 0
  for (const item of collection) {
    const rawNumber = String(item.id || '').replace(`${prefix}-`, '')
    const numericValue = Number.parseInt(rawNumber, 10)
    if (!Number.isNaN(numericValue)) {
      maxValue = Math.max(maxValue, numericValue)
    }
  }
  return `${prefix}-${String(maxValue + 1).padStart(4, '0')}`
}

export function InventoryProvider({ children }) {
  const [state, setState] = useState(() => {
    const loaded = loadInventoryData()
    return normalizeLoadedData(loaded) || mockData
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const addItem = useCallback((entity, payload) => {
    const config = ENTITY_CONFIG[entity]
    if (!config) return

    setState((previous) => {
      const collection = previous[entity]
      const nextItem = {
        ...payload,
        id: payload.id || getNextId(collection, config.prefix),
      }
      const nextState = { ...previous, [entity]: [nextItem, ...collection] }
      saveInventoryData(nextState)
      return nextState
    })
  }, [])

  const updateItem = useCallback((entity, id, payload) => {
    if (!ENTITY_CONFIG[entity]) return

    setState((previous) => {
      const nextState = {
        ...previous,
        [entity]: previous[entity].map((item) =>
          item.id === id ? { ...item, ...payload, id } : item,
        ),
      }
      saveInventoryData(nextState)
      return nextState
    })
  }, [])

  const removeItem = useCallback((entity, id) => {
    if (!ENTITY_CONFIG[entity]) return

    setState((previous) => {
      const nextState = {
        ...previous,
        [entity]: previous[entity].filter((item) => item.id !== id),
      }
      saveInventoryData(nextState)
      return nextState
    })
  }, [])

  const resetToMockData = useCallback(() => {
    setState(mockData)
    saveInventoryData(mockData)
  }, [])

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
      resetToMockData,
    }),
    [state, isLoading, summaries, lookups, addItem, updateItem, removeItem, resetToMockData],
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