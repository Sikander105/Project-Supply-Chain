import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import Table from '../components/Table'
import { Stat, StatusPill } from '../components/DashboardWidgets'
import PageHeader from '../components/PageHeader'
import { useInventory } from '../store/inventoryStore'
import {
  formatCurrency,
  formatNumber,
  getLowStockProducts,
  getProductStatus,
  getStockLevelOverview,
  groupByCategory,
  summarizePurchaseOrderStatuses,
} from '../utils'

const PIE_COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#8b5cf6']

export default function DashboardPage() {
  const {
    products = [],
    vendors = [],
    warehouses = [],
    purchaseOrders = [],
    shipments = [],
    summaries,
    isLoading,
  } = useInventory()

  if (isLoading) {
    return (
      <section className="page">
        <PageHeader
          title="Dashboard"
          subtitle="Real-time inventory and supply chain overview"
        />
        <p className="empty-inline">Loading dashboard data...</p>
      </section>
    )
  }

  const recentInventory = [...products]
    .sort((a, b) => {
      const aKey = String(a?.id ?? '')
      const bKey = String(b?.id ?? '')
      return bKey.localeCompare(aKey)
    })
    .slice(0, 6)

  const lowStockProducts = getLowStockProducts(products)
  const productsByCategory = groupByCategory(products)
  const purchaseOrderByStatus = summarizePurchaseOrderStatuses(purchaseOrders)
  const stockLevelOverview = getStockLevelOverview(products)

  return (
    <section className="page">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time inventory and supply chain overview"
      />

      <div className="stats-grid stats-grid--dashboard">
        <Stat label="Total Products" value={formatNumber(summaries?.totalProducts ?? 0)} />
        <Stat
          label="Low Stock Items"
          value={formatNumber(summaries?.lowStockItems ?? 0)}
          tone={(summaries?.lowStockItems ?? 0) > 0 ? 'warning' : 'default'}
        />
        <Stat label="Total Vendors" value={formatNumber(vendors.length)} />
        <Stat label="Total Warehouses" value={formatNumber(warehouses.length)} />
        <Stat
          label="Pending Purchase Orders"
          value={formatNumber(summaries?.pendingPurchaseOrders ?? 0)}
          tone={(summaries?.pendingPurchaseOrders ?? 0) > 0 ? 'info' : 'default'}
        />
        <Stat label="Total Shipments" value={formatNumber(shipments.length)} />
        <Stat label="Total Stock Units" value={formatNumber(summaries?.totalStockUnits ?? 0)} />
        <Stat
          label="Inventory Value"
          value={formatCurrency(summaries?.totalInventoryValue ?? 0)}
        />
      </div>

      <div className="dashboard-grid">
        <article className="card">
          <h3>Recent Inventory</h3>
          <Table
            rows={recentInventory}
            columns={[
              { key: 'id', header: 'ID' },
              { key: 'name', header: 'Name' },
              { key: 'category', header: 'Category' },
              { key: 'stock', header: 'Stock', render: (item) => formatNumber(item.stock ?? 0) },
              {
                key: 'status',
                header: 'Status',
                render: (item) => <StatusPill status={getProductStatus(item)} />,
              },
            ]}
            emptyTitle="No products available"
            emptyDescription="Add products to see inventory activity here."
          />
        </article>

        <article className="card card--alerts">
          <h3>Low Stock Alerts</h3>
          {lowStockProducts.length ? (
            <ul className="alert-list">
              {lowStockProducts.slice(0, 8).map((product) => (
                <li key={product.id} className="alert-list__item">
                  <div>
                    <p className="alert-list__title">{product.name}</p>
                    <p className="alert-list__subtitle">
                      Reorder at {formatNumber(product.reorderLevel ?? 0)} units
                    </p>
                  </div>
                  <StatusPill status={getProductStatus(product)} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-inline">No critical stock alerts. Inventory looks healthy.</p>
          )}
        </article>
      </div>

      <div className="chart-grid">
        <article className="card">
          <h3>Products by Category</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={productsByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={96}
                  paddingAngle={4}
                  label
                >
                  {productsByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <h3>Purchase Orders by Status</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={purchaseOrderByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <h3>Stock Levels Overview</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stockLevelOverview}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  )
}
