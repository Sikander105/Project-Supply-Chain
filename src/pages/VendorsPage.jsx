import { useMemo, useState } from 'react'
import FormField from '../components/FormField'
import ModalSystem from '../components/ModalSystem'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table'
import { useInventory } from '../store/inventoryStore'
import { useToast } from '../store/toastStore'

const VENDOR_DEFAULTS = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
}

function validateVendor(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Vendor name is required.'
  if (!values.contactPerson.trim()) {
    errors.contactPerson = 'Contact person is required.'
  }
  if (!values.phone.trim()) errors.phone = 'Phone number is required.'
  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  return errors
}

export default function VendorsPage() {
  const { vendors, isLoading, addItem, updateItem, removeItem } = useInventory()
  const { pushToast } = useToast()
  const [search, setSearch] = useState('')
  const [editingVendor, setEditingVendor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [values, setValues] = useState({ ...VENDOR_DEFAULTS })

  const visibleVendors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return [...vendors]
      .filter((vendor) => {
        if (!normalizedSearch) return true
        return (
          vendor.name.toLowerCase().includes(normalizedSearch) ||
          vendor.contactPerson.toLowerCase().includes(normalizedSearch)
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [vendors, search])

  function openCreateModal() {
    setEditingVendor(null)
    setValues({ ...VENDOR_DEFAULTS })
    setErrors({})
    setIsModalOpen(true)
  }

  function openEditModal(vendor) {
    setEditingVendor(vendor)
    setValues({
      name: vendor.name,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingVendor(null)
    setErrors({})
  }

  function handleSave(event) {
    event.preventDefault()
    const validationErrors = validateVendor(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = {
      name: values.name.trim(),
      contactPerson: values.contactPerson.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
    }

    if (editingVendor) {
      updateItem('vendors', editingVendor.id, payload)
      pushToast(`Updated ${payload.name} successfully.`)
    } else {
      addItem('vendors', payload)
      pushToast(`Added ${payload.name} to vendors.`)
    }
    closeModal()
  }

  function handleDelete() {
    if (!deleteTarget) return
    removeItem('vendors', deleteTarget.id)
    pushToast(`Deleted ${deleteTarget.name}.`)
    setDeleteTarget(null)
  }

  function updateValue(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <PageHeader title="Vendors" onAddClick={() => {}} />
        <div className="text-center py-12">
          <p className="text-gray-500">Loading vendors...</p>
        </div>
      </div>
    )
  }

  if (!vendors || vendors.length === 0) {
    return (
      <div className="p-8">
        <PageHeader title="Vendors" onAddClick={openCreateModal} />
        <div className="text-center py-12">
          <p className="text-gray-500">No vendors yet. Create one to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <section className="page">
      <PageHeader
        title="Vendors"
        subtitle="Manage supplier and partner contact information."
        actions={
          <button type="button" className="button" onClick={openCreateModal}>
            Add Vendor
          </button>
        }
      />

      <article className="card">
        <Table
          rows={visibleVendors}
          search={{
            value: search,
            onChange: setSearch,
            placeholder: 'Search vendors...',
          }}
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Vendor Name' },
            { key: 'contactPerson', header: 'Contact Person' },
            { key: 'phone', header: 'Phone' },
            { key: 'email', header: 'Email' },
            {
              key: 'actions',
              header: 'Actions',
              render: (vendor) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => openEditModal(vendor)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button--danger button--small"
                    onClick={() => setDeleteTarget(vendor)}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          emptyTitle="No vendors found"
          emptyDescription="Add your first vendor to start linking procurement data."
        />
      </article>

      <ModalSystem
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormField
            label="Vendor Name"
            name="name"
            value={values.name}
            onChange={updateValue}
            error={errors.name}
          />
          <FormField
            label="Contact Person"
            name="contactPerson"
            value={values.contactPerson}
            onChange={updateValue}
            error={errors.contactPerson}
          />
          <FormField
            label="Phone"
            name="phone"
            value={values.phone}
            onChange={updateValue}
            error={errors.phone}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={updateValue}
            error={errors.email}
          />
          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="button">
              Save Vendor
            </button>
          </div>
        </form>
      </ModalSystem>

      <ModalSystem
        isOpen={Boolean(deleteTarget)}
        title="Delete Vendor"
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
