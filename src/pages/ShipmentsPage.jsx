import { useMemo, useState } from 'react'
import FormField from '../components/FormField'
import ModalSystem from '../components/ModalSystem'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import { StatusPill } from '../components/DashboardWidgets'
import { useInventory } from '../store/inventoryStore'
import { useToast } from '../store/toastStore'
import { formatDate, formatNumber } from '../utils'

const SHIPMENT_DEFAULTS = {
  productId: '',
  quantity: '',
  warehouseId: '',
  receivedDate: '',
  status: 'In Transit',
}

const SHIPMENT_STATUSES = ['In Transit', 'Received', 'Delayed']

function validateShipment(values) {
  const errors = {}
  if (!values.productId) errors.productId = 'Select a product.'
  if (!values.warehouseId) errors.warehouseId = 'Select a warehouse.'
  if (values.quantity === '' || Number(values.quantity) <= 0) {
    errors.quantity = 'Quantity must be greater than 0.'
  }
  if (!values.receivedDate) errors.receivedDate = 'Received date is required.'
  if (!values.status) errors.status = 'Status is required.'
  return errors
}

export default function ShipmentsPage() {
  const { shipments, products, warehouses, lookups, addItem, updateItem, removeItem } =
    useInventory()
  const { pushToast } = useToast()
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [editingShipment, setEditingShipment] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState({ ...SHIPMENT_DEFAULTS })

  const visibleShipments = useMemo(() => {
    return [...shipments]
      .filter((shipment) =>
        warehouseFilter === 'all' ? true : shipment.warehouseId === warehouseFilter,
      )
      .filter((shipment) =>
        dateFilter ? shipment.receivedDate === dateFilter : true,
      )
      .sort(
        (a, b) =>
          new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime(),
      )
  }, [shipments, warehouseFilter, dateFilter])

  function openCreateModal() {
    setEditingShipment(null)
    setValues({
      ...SHIPMENT_DEFAULTS,
      receivedDate: new Date().toISOString().slice(0, 10),
    })
    setErrors({})
    setIsModalOpen(true)
  }

  function openEditModal(shipment) {
    setEditingShipment(shipment)
    setValues({
      productId: shipment.productId,
      quantity: shipment.quantity,
      warehouseId: shipment.warehouseId,
      receivedDate: shipment.receivedDate,
      status: shipment.status,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingShipment(null)
    setErrors({})
  }

  function handleSave(event) {
    event.preventDefault()
    const validationErrors = validateShipment(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = {
      productId: values.productId,
      quantity: Number(values.quantity),
      warehouseId: values.warehouseId,
      receivedDate: values.receivedDate,
      status: values.status,
    }

    if (editingShipment) {
      updateItem('shipments', editingShipment.id, payload)
      pushToast(`Updated shipment ${editingShipment.id}.`)
    } else {
      addItem('shipments', payload)
      pushToast('Shipment saved successfully.')
    }
    closeModal()
  }

  function handleDelete() {
    if (!deleteTarget) return
    removeItem('shipments', deleteTarget.id)
    pushToast(`Deleted shipment ${deleteTarget.id}.`)
    setDeleteTarget(null)
  }

  function updateValue(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  return (
    <section className="page">
      <PageHeader
        title="Shipments"
        subtitle="Track inbound shipments and receiving activity by warehouse."
        actions={
          <button type="button" className="button" onClick={openCreateModal}>
            Add Shipment
          </button>
        }
      />

      <article className="card">
        <Table
          rows={visibleShipments}
          filters={[
            {
              key: 'warehouse',
              value: warehouseFilter,
              onChange: setWarehouseFilter,
              options: [
                { value: 'all', label: 'All Warehouses' },
                ...warehouses.map((warehouse) => ({
                  value: warehouse.id,
                  label: warehouse.name,
                })),
              ],
            },
          ]}
          actions={
            <input
              className="input"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          }
          columns={[
            { key: 'id', header: 'Shipment ID' },
            {
              key: 'productId',
              header: 'Product',
              render: (shipment) =>
                lookups.productById[shipment.productId]?.name || 'Unknown Product',
            },
            {
              key: 'quantity',
              header: 'Quantity',
              render: (shipment) => formatNumber(shipment.quantity),
            },
            {
              key: 'warehouseId',
              header: 'Warehouse',
              render: (shipment) =>
                lookups.warehouseById[shipment.warehouseId]?.name || 'Unknown Warehouse',
            },
            {
              key: 'receivedDate',
              header: 'Received Date',
              render: (shipment) => formatDate(shipment.receivedDate),
            },
            {
              key: 'status',
              header: 'Status',
              render: (shipment) => <StatusPill status={shipment.status} />,
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (shipment) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => openEditModal(shipment)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button--danger button--small"
                    onClick={() => setDeleteTarget(shipment)}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          emptyTitle="No shipments found"
          emptyDescription="Log incoming shipments to monitor receiving flow."
        />
      </article>

      <ModalSystem
        title={editingShipment ? 'Edit Shipment' : 'Add Shipment'}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSave}>
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
          <FormField
            label="Received Date"
            name="receivedDate"
            type="date"
            value={values.receivedDate}
            onChange={updateValue}
            error={errors.receivedDate}
          />
          <FormField
            label="Status"
            name="status"
            type="select"
            value={values.status}
            onChange={updateValue}
            error={errors.status}
            options={SHIPMENT_STATUSES.map((status) => ({ value: status, label: status }))}
          />
          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="button">
              Save Shipment
            </button>
          </div>
        </form>
      </ModalSystem>

      <ModalSystem
        isOpen={Boolean(deleteTarget)}
        title="Delete Shipment"
        mode="confirm"
        message={
          deleteTarget ? `Are you sure you want to delete shipment ${deleteTarget.id}?` : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </section>
  )
}
