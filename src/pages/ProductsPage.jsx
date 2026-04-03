import { useMemo, useState } from 'react'
import FormField from '../components/FormField'
import ModalSystem from '../components/ModalSystem'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import { StatusPill } from '../components/DashboardWidgets'
import { useInventory } from '../store/inventoryStore'
import { useToast } from '../store/toastStore'
import { formatCurrency, formatNumber, getProductStatus, PRODUCT_STOCK_STATUS } from '../utils'

const PRODUCT_DEFAULTS = {
  name: '',
  category: '',
  stock: '',
  price: '',
  reorderLevel: '',
  warehouseId: '',
}

function validateProduct(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Product name is required.'
  if (!values.category.trim()) errors.category = 'Category is required.'
  if (values.stock === '' || Number(values.stock) < 0) {
    errors.stock = 'Stock must be 0 or greater.'
  }
  if (values.price === '' || Number(values.price) <= 0) {
    errors.price = 'Price must be greater than 0.'
  }
  if (values.reorderLevel === '' || Number(values.reorderLevel) < 0) {
    errors.reorderLevel = 'Reorder level must be 0 or greater.'
  }
  if (!values.warehouseId) {
    errors.warehouseId = 'Select a warehouse.'
  }
  return errors
}

export default function ProductsPage() {
  const { products, warehouses, addItem, updateItem, removeItem } = useInventory()
  const { pushToast } = useToast()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState({ ...PRODUCT_DEFAULTS })

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort(),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const list = products
      .filter((product) =>
        normalizedSearch ? product.name.toLowerCase().includes(normalizedSearch) : true,
      )
      .filter((product) => (categoryFilter === 'all' ? true : product.category === categoryFilter))
      .filter((product) => {
        if (statusFilter === 'all') return true
        return getProductStatus(product) === statusFilter
      })

    const [key, direction] = sortBy.split('-')
    list.sort((a, b) => {
      if (key === 'name') {
        return direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      if (key === 'stock') {
        return direction === 'asc' ? a.stock - b.stock : b.stock - a.stock
      }
      return direction === 'asc' ? a.price - b.price : b.price - a.price
    })

    return list
  }, [products, search, categoryFilter, statusFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const activePage = Math.min(page, totalPages)
  const pagedProducts = filteredProducts.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  )

  function openCreateModal() {
    setEditingProduct(null)
    setValues({ ...PRODUCT_DEFAULTS })
    setErrors({})
    setIsModalOpen(true)
  }

  function openEditModal(product) {
    setEditingProduct(product)
    setValues({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
      reorderLevel: product.reorderLevel,
      warehouseId: product.warehouseId,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingProduct(null)
    setErrors({})
  }

  function handleSave(event) {
    event.preventDefault()
    const validationErrors = validateProduct(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = {
      name: values.name.trim(),
      category: values.category.trim(),
      stock: Number(values.stock),
      price: Number(values.price),
      reorderLevel: Number(values.reorderLevel),
      warehouseId: values.warehouseId,
    }

    if (editingProduct) {
      updateItem('products', editingProduct.id, payload)
      pushToast(`Updated ${payload.name} successfully.`)
    } else {
      addItem('products', payload)
      pushToast(`Added ${payload.name} to inventory.`)
    }
    closeModal()
  }

  function handleDelete() {
    if (!deleteTarget) return
    removeItem('products', deleteTarget.id)
    pushToast(`Deleted ${deleteTarget.name}.`)
    setDeleteTarget(null)
  }

  function handlePageChange(nextPage) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  function handlePageSizeChange(size) {
    setPageSize(size)
    setPage(1)
  }

  function updateValue(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  return (
    <section className="page">
      <PageHeader
        title="Products"
        subtitle="Manage catalog items, stock levels, and pricing."
        actions={
          <button type="button" className="button" onClick={openCreateModal}>
            Add Product
          </button>
        }
      />

      <article className="card">
        <Table
          rows={pagedProducts}
          search={{
            value: search,
            onChange: setSearch,
            placeholder: 'Search by product name...',
          }}
          filters={[
            {
              key: 'category',
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { value: 'all', label: 'All Categories' },
                ...categories.map((category) => ({ value: category, label: category })),
              ],
            },
            {
              key: 'status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'All Stock Statuses' },
                { value: PRODUCT_STOCK_STATUS.inStock, label: PRODUCT_STOCK_STATUS.inStock },
                { value: PRODUCT_STOCK_STATUS.lowStock, label: PRODUCT_STOCK_STATUS.lowStock },
                {
                  value: PRODUCT_STOCK_STATUS.outOfStock,
                  label: PRODUCT_STOCK_STATUS.outOfStock,
                },
              ],
            },
          ]}
          actions={
            <select className="select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="stock-asc">Sort: Stock (Low to High)</option>
              <option value="stock-desc">Sort: Stock (High to Low)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
            </select>
          }
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Name' },
            { key: 'category', header: 'Category' },
            {
              key: 'stock',
              header: 'Stock',
              render: (product) => (
                <span
                  className={
                    getProductStatus(product) !== PRODUCT_STOCK_STATUS.inStock
                      ? 'text-warning'
                      : ''
                  }
                >
                  {formatNumber(product.stock)}
                </span>
              ),
            },
            {
              key: 'price',
              header: 'Price',
              render: (product) => formatCurrency(product.price),
            },
            {
              key: 'status',
              header: 'Status',
              render: (product) => <StatusPill status={getProductStatus(product)} />,
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (product) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => openEditModal(product)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button--danger button--small"
                    onClick={() => setDeleteTarget(product)}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          emptyTitle="No products found"
          emptyDescription="Try changing filters or add a new product."
          pagination={{
            currentPage: activePage,
            totalPages,
            onPageChange: handlePageChange,
            pageSize,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </article>

      <ModalSystem
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormField
            label="Product Name"
            name="name"
            value={values.name}
            onChange={updateValue}
            error={errors.name}
            placeholder="e.g. Industrial Safety Gloves"
          />
          <FormField
            label="Category"
            name="category"
            value={values.category}
            onChange={updateValue}
            error={errors.category}
            placeholder="e.g. Safety"
          />
          <FormField
            label="Stock"
            name="stock"
            type="number"
            min="0"
            value={values.stock}
            onChange={updateValue}
            error={errors.stock}
          />
          <FormField
            label="Price (USD)"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={updateValue}
            error={errors.price}
          />
          <FormField
            label="Reorder Level"
            name="reorderLevel"
            type="number"
            min="0"
            value={values.reorderLevel}
            onChange={updateValue}
            error={errors.reorderLevel}
          />
          <FormField
            label="Warehouse"
            name="warehouseId"
            type="select"
            value={values.warehouseId}
            onChange={updateValue}
            error={errors.warehouseId}
            options={[
              { value: '', label: 'Select warehouse' },
              ...warehouses.map((warehouse) => ({
                value: warehouse.id,
                label: `${warehouse.name} (${warehouse.location})`,
              })),
            ]}
          />

          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="button">
              Save Product
            </button>
          </div>
        </form>
      </ModalSystem>

      <ModalSystem
        isOpen={Boolean(deleteTarget)}
        title="Delete Product"
        mode="confirm"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`
            : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </section>
  )
}
