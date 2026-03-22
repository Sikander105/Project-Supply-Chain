import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'supply_chain_inventory_v1'

const ENTITY_CONFIG = {
  products: { prefix: 'PRD' },
  vendors: { prefix: 'VND' },
  warehouses: { prefix: 'WH' },
  purchaseOrders: { prefix: 'PO' },
  shipments: { prefix: 'SHP' },
}

const InventoryContext = createContext(null)

function buildEmptyInventory() {
  return Object.keys(ENTITY_CONFIG).reduce((acc, key) => {
    acc[key] = []
    return acc
  }, {})
}

function loadInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildEmptyInventory()

    const parsed = JSON.parse(raw)
    const base = buildEmptyInventory()

    for (const key of Object.keys(base)) {
      base[key] = Array.isArray(parsed?.[key]) ? parsed[key] : []
    }

    return base
  } catch {
    return buildEmptyInventory()
  }
}

function nextId(entityKey, currentItems) {
  const prefix = ENTITY_CONFIG[entityKey]?.prefix ?? 'ID'
  return `${prefix}-${String(currentItems.length + 1).padStart(4, '0')}`
}

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState(() => loadInventory())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
  }, [inventory])

  const getCollection = useCallback(
    (entityKey) => inventory[entityKey] ?? [],
    [inventory],
  )

  const addRecord = useCallback((entityKey, payload) => {
    setInventory((prev) => {
      const current = prev[entityKey] ?? []
      const created = {
        id: payload?.id ?? nextId(entityKey, current),
        createdAt: new Date().toISOString(),
        ...payload,
      }

      return {
        ...prev,
        [entityKey]: [...current, created],
      }
    })
  }, [])

  const updateRecord = useCallback((entityKey, id, updates) => {
    setInventory((prev) => ({
      ...prev,
      [entityKey]: (prev[entityKey] ?? []).map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item,
      ),
    }))
  }, [])

  const removeRecord = useCallback((entityKey, id) => {
    setInventory((prev) => ({
      ...prev,
      [entityKey]: (prev[entityKey] ?? []).filter((item) => item.id !== id),
    }))
  }, [])

  const resetInventory = useCallback(() => {
    setInventory(buildEmptyInventory())
  }, [])

  const value = useMemo(
    () => ({
      inventory,
      entityConfig: ENTITY_CONFIG,
      getCollection,
      addRecord,
      updateRecord,
      removeRecord,
      resetInventory,
    }),
    [inventory, getCollection, addRecord, updateRecord, removeRecord, resetInventory],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventoryStore() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventoryStore must be used within InventoryProvider')
  }
  return context
}