import { useMemo, useState } from 'react'
import FormField from '../components/FormField'
import ModalSystem from '../components/ModalSystem'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import { useInventory } from '../store/inventoryStore'
import { useToast } from '../store/toastStore'
import { formatNumber } from '../utils'

const WAREHOUSE_DEFAULTS = {
  name: '',
  location: '',
  capacity: '',
  currentUsage: '',
}

function validateWarehouse(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Warehouse name is required.'
  if (!values.location.trim()) errors.location = 'Location is required.'
  if (values.capacity === '' || Number(values.capacity) <= 0) {
    errors.capacity = 'Capacity must be greater than 0.'
  }
  if (values.currentUsage === '' || Number(values.currentUsage) < 0) {
    errors.currentUsage = 'Current usage must be 0 or greater.'
  }
  if (Number(values.currentUsage) > Number(values.capacity)) {
    errors.currentUsage = 'Current usage cannot exceed capacity.'
  }
  return errors
}

export default function WarehousesPage() {
  const { warehouses, isLoading, addItem, updateItem, removeItem } = useInventory()
  const { pushToast } = useToast()
  const [search, setSearch] = useState('')
  const [editingWarehouse, setEditingWarehouse] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState({ ...WAREHOUSE_DEFAULTS })

  const visibleWarehouses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return [...warehouses].filter((warehouse) => {
      if (!normalizedSearch) return true
      return (
        warehouse.name.toLowerCase().includes(normalizedSearch) ||
        warehouse.location.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [warehouses, search])

  function openCreateModal() {
    setEditingWarehouse(null)
    setValues({ ...WAREHOUSE_DEFAULTS })
    setErrors({})
    setIsModalOpen(true)
  }

  function openEditModal(warehouse) {
    setEditingWarehouse(warehouse)
    setValues({
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity,
      currentUsage: warehouse.currentUsage,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingWarehouse(null)
    setErrors({})
  }

  function handleSave(event) {
    event.preventDefault()
    const validationErrors = validateWarehouse(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = {
      name: values.name.trim(),
      location: values.location.trim(),
      capacity: Number(values.capacity),
      currentUsage: Number(values.currentUsage),
    }

    if (editingWarehouse) {
      updateItem('warehouses', editingWarehouse.id, payload)
      pushToast(`Updated ${payload.name} successfully.`)
    } else {
      addItem('warehouses', payload)
      pushToast(`Added ${payload.name} to warehouses.`)
    }
    closeModal()
  }

  function handleDelete() {
    if (!deleteTarget) return
    removeItem('warehouses', deleteTarget.id)
    pushToast(`Deleted ${deleteTarget.name}.`)
    setDeleteTarget(null)
  }

  function updateValue(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <PageHeader title="Warehouses" onAddClick={() => {}} />
        <div className="text-center py-12">
          <p className="text-gray-500">Loading warehouses...</p>
        </div>
      </div>
    )
  }

  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="p-8">
        <PageHeader title="Warehouses" onAddClick={openCreateModal} />
        <div className="text-center py-12">
          <p className="text-gray-500">No warehouses yet. Create one to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <section className="page">
      <PageHeader
        title="Warehouses"
        subtitle="Track location capacity and active storage utilization."
        actions={
          <button type="button" className="button" onClick={openCreateModal}>
            Add Warehouse
          </button>
        }
      />

      <article className="card">
        <Table
          rows={visibleWarehouses}
          search={{
            value: search,
            onChange: setSearch,
            placeholder: 'Search warehouse name or location...',
          }}
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Warehouse Name' },
            { key: 'location', header: 'Location' },
            {
              key: 'capacity',
              header: 'Capacity',
              render: (warehouse) => formatNumber(warehouse.capacity),
            },
            {
              key: 'currentUsage',
              header: 'Current Usage',
              render: (warehouse) => (
                <div>
                  <p>{formatNumber(warehouse.currentUsage)}</p>
                  <div className="usage-bar">
                    <span
                      style={{
                        width: `${Math.min(
                          100,
                          (warehouse.currentUsage / warehouse.capacity) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (warehouse) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => openEditModal(warehouse)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button--danger button--small"
                    onClick={() => setDeleteTarget(warehouse)}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          emptyTitle="No warehouses found"
          emptyDescription="Add warehouse locations to monitor storage capacity."
        />
      </article>

      <ModalSystem
        title={editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormField
            label="Warehouse Name"
            name="name"
            value={values.name}
            onChange={updateValue}
            error={errors.name}
          />
          <FormField
            label="Location"
            name="location"
            value={values.location}
            onChange={updateValue}
            error={errors.location}
          />
          <FormField
            label="Capacity"
            name="capacity"
            type="number"
            min="1"
            value={values.capacity}
            onChange={updateValue}
            error={errors.capacity}
          />
          <FormField
            label="Current Usage"
            name="currentUsage"
            type="number"
            min="0"
            value={values.currentUsage}
            onChange={updateValue}
            error={errors.currentUsage}
          />
          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="button">
              Save Warehouse
            </button>
          </div>
        </form>
      </ModalSystem>

      <ModalSystem
        isOpen={Boolean(deleteTarget)}
        title="Delete Warehouse"
        mode="confirm"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.name}?`
            : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </section>
  )
}
