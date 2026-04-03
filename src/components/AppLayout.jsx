import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { useInventory } from '../store/inventoryStore'
import { useToast } from '../store/toastStore'

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
      </svg>
    ),
  },
  {
    label: 'Products',
    path: '/products',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 2 9 4.5v11L12 22l-9-4.5v-11L12 2Zm0 2.2L6 7l6 2.8L18 7l-6-2.8ZM5 8.7v7.6l6 3v-7.7L5 8.7Zm8 10.6 6-3V8.7l-6 2.9v7.7Z" />
      </svg>
    ),
  },
  {
    label: 'Vendors',
    path: '/vendors',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11c1.66 0 3-1.79 3-4s-1.34-4-3-4-3 1.79-3 4 1.34 4 3 4Zm-8 0c1.66 0 3-1.79 3-4S9.66 3 8 3 5 4.79 5 7s1.34 4 3 4Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z" />
      </svg>
    ),
  },
  {
    label: 'Warehouses',
    path: '/warehouses',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 2 8v13h20V8L12 3Zm8 16h-3v-4h-4v4H4V9.3l8-4 8 4V19Z" />
      </svg>
    ),
  },
  {
    label: 'Purchase Orders',
    path: '/purchase-orders',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM8 11h8v1.5H8V11Zm0 4h8v1.5H8V15Zm0 4h5v1.5H8V19Z" />
      </svg>
    ),
  },
  {
    label: 'Shipments',
    path: '/shipments',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5h13v9h2.5l2.5 3.3V20h-2a3 3 0 1 1-6 0H9a3 3 0 1 1-6 0H1v-2h2V5Zm2 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm11 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm2-6h-2v3h4.1L18 10Z" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20h16v2H2V3h2v17Zm3-2v-7h3v7H7Zm5 0V6h3v12h-3Zm5 0v-4h3v4h-3Z" />
      </svg>
    ),
  },
]

function LoadingView() {
  return (
    <div className="loading-view">
      <div className="loading-view__spinner" />
      <p>Loading inventory workspace...</p>
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">SC</div>
        <div>
          <p className="sidebar__brand-title">Supply Chain OS</p>
          <p className="sidebar__brand-subtitle">Track. Move. Deliver.</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function TopBar() {
  const now = new Date()
  return (
    <header className="topbar">
      <div>
        <p className="topbar__label">Operations Center</p>
        <h2 className="topbar__title">Supply Chain & Inventory Management</h2>
      </div>
      <div className="topbar__meta">
        <span>Last sync: {now.toLocaleTimeString()}</span>
      </div>
    </header>
  )
}

function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <article key={toast.id} className={`toast toast--${toast.type}`}>
          <p>{toast.message}</p>
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={() => dismissToast(toast.id)}
          >
            Dismiss
          </button>
        </article>
      ))}
    </div>
  )
}

export default function AppLayout() {
  const { isLoading } = useInventory()

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <TopBar />
        <main className="app-shell__content">
          {isLoading ? <LoadingView /> : <Outlet />}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}