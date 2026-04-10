import { useMemo, useState } from 'react'
import FormField from '../components/FormField'
import ModalSystem from '../components/ModalSystem'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import { StatusPill } from '../components/DashboardWidgets'
import { useInventory } from '../store/inventoryStore'
import { useToast } from '../store/toastStore'
import { formatDate, formatNumber } from '../utils'

const PO_DEFAULTS = {
  vendorId: '',
  productId: '',
  quantity: '',
  status: 'Pending',
  createdDate: '',
}

const PO_STATUSES = ['Pending', 'Approved', 'Completed', 'Cancelled']

function validatePurchaseOrder(values) {
  const errors = {}
  if (!values.vendorId) errors.vendorId = 'Select a supplier.'
  if (!values.productId) errors.productId = 'Select a product.'
  if (values.quantity === '' || Number(values.quantity) <= 0) {
    errors.quantity = 'Quantity must be greater than 0.'
  }
  if (!values.status) errors.status = 'Status is required.'
  if (!values.createdDate) errors.createdDate = 'Created date is required.'
  return errors
}

export default function PurchaseOrdersPage() {
  const { purchaseOrders, products, vendors, lookups, addItem, updateItem, removeItem, isLoading } =
    useInventory()
  const { pushToast } = useToast()
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortByDate, setSortByDate] = useState('desc')
  const [editingOrder, setEditingOrder] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState({ ...PO_DEFAULTS })

  const visibleOrders = useMemo(() => {
    const list = (purchaseOrders || []).filter((order) =>
      statusFilter === 'all' ? true : order.status === statusFilter,
    )
    list.sort((a, b) => {
      const aDate = new Date(a.createdDate || 0).getTime()
      const bDate = new Date(b.createdDate || 0).getTime()
      return sortByDate === 'asc' ? aDate - bDate : bDate - aDate
    })
    return list
  }, [purchaseOrders, statusFilter, sortByDate])

  if (isLoading) {
    return <section className="page">Loading purchase orders...</section>
  }

  function openCreateModal() {
    setEditingOrder(null)
    setValues({ ...PO_DEFAULTS, createdDate: new Date().toISOString().slice(0, 10) })
    setErrors({})
    setIsModalOpen(true)
  }

  function openEditModal(order) {
    setEditingOrder(order)
    setValues({
      vendorId: order.vendorId,
      productId: order.productId,
      quantity: order.quantity,
      status: order.status,
      createdDate: order.createdDate,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingOrder(null)
    setErrors({})
  }

  function handleSave(event) {
    event.preventDefault()
    const validationErrors = validatePurchaseOrder(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = {
      vendorId: values.vendorId,
      productId: values.productId,
      quantity: Number(values.quantity),
      status: values.status,
      createdDate: values.createdDate,
    }

    if (editingOrder) {
      updateItem('purchaseOrders', editingOrder.id, payload)
      pushToast(`Updated purchase order ${editingOrder.id}.`)
    } else {
      addItem('purchaseOrders', payload)
      pushToast('Created purchase order successfully.')
    }
    closeModal()
  }

  function handleDelete() {
    if (!deleteTarget) return
    removeItem('purchaseOrders', deleteTarget.id)
    pushToast(`Deleted purchase order ${deleteTarget.id}.`)
    setDeleteTarget(null)
  }

  function updateValue(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  return (
    <section className="page">
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage supplier procurement requests and status workflow."
        actions={
          <button type="button" className="button" onClick={openCreateModal}>
            Add Purchase Order
          </button>
        }
      />

      <article className="card">
        <Table
          rows={visibleOrders}
          filters={[
            {
              key: 'status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'All Statuses' },
                ...PO_STATUSES.map((status) => ({ value: status, label: status })),
              ],
            },
          ]}
          actions={
            <select
              className="select"
              value={sortByDate}
              onChange={(event) => setSortByDate(event.target.value)}
            >
              <option value="desc">Sort: Date (Newest)</option>
              <option value="asc">Sort: Date (Oldest)</option>
            </select>
          }
          columns={[
            { key: 'id', header: 'PO ID' },
            {
              key: 'vendorId',
              header: 'Supplier',
              render: (order) => lookups.vendorById[order.vendorId]?.name || 'Unknown Vendor',
            },
            {
              key: 'productId',
              header: 'Product',
              render: (order) => lookups.productById[order.productId]?.name || 'Unknown Product',
            },
            {
              key: 'quantity',
              header: 'Quantity',
              render: (order) => formatNumber(order.quantity),
            },
            {
              key: 'status',
              header: 'Status',
              render: (order) => <StatusPill status={order.status} />,
            },
            {
              key: 'createdDate',
              header: 'Created Date',
              render: (order) => formatDate(order.createdDate),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (order) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => openEditModal(order)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button--danger button--small"
                    onClick={() => setDeleteTarget(order)}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          emptyTitle="No purchase orders found"
          emptyDescription="Create a purchase order to track supplier procurement."
        />
      </article>

      <ModalSystem
        title={editingOrder ? 'Edit Purchase Order' : 'Add Purchase Order'}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormField
            label="Supplier"
            name="vendorId"
            type="select"
            value={values.vendorId}
            onChange={updateValue}
            error={errors.vendorId}
            options={[
              { value: '', label: 'Select supplier' },
              ...vendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
            ]}
          />
          <FormField
            label="Product"
            name="productId"
            type="select"
            value={values.productId}
            onChange={updateValue}
            error={errors.productId}
            options={[
              { value: '', label: 'Select product' },
              ...products.map((product) => ({ value: product.id, label: product.name })),
            ]}
          />
          <FormField
            label="Quantity"
            name="quantity"
            type="number"
            min="1"
            value={values.quantity}
            onChange={updateValue}
            error={errors.quantity}
          />
          <FormField
            label="Status"
            name="status"
            type="select"
            value={values.status}
            onChange={updateValue}
            error={errors.status}
            options={PO_STATUSES.map((status) => ({ value: status, label: status }))}
          />
          <FormField
            label="Created Date"
            name="createdDate"
            type="date"
            value={values.createdDate}
            onChange={updateValue}
            error={errors.createdDate}
          />
          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="button">
              Save Purchase Order
            </button>
          </div>
        </form>
      </ModalSystem>

      <ModalSystem
        isOpen={Boolean(deleteTarget)}
        title="Delete Purchase Order"
        mode="confirm"
        message={
          deleteTarget
            ? `Are you sure you want to delete purchase order ${deleteTarget.id}?`
            : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </section>
  )
}
