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
  getInventoryValueByCategory,
  getLowStockProducts,
  getProductStatus,
  getProductsByStockLevel,
  getPurchaseOrdersByStatus,
} from '../utils'

const PIE_COLORS = ['#0f766e', '#2563eb', '#f59e0b', '#8b5cf6', '#dc2626']

export default function ReportsPage() {
  const { products, vendors, warehouses, purchaseOrders, shipments, summaries } =
    useInventory()

  const lowStockProducts = getLowStockProducts(products)
  const topStockedProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
  const categorySummary = Object.entries(
    products.reduce((accumulator, product) => {
      const category = product.category || 'Uncategorized'
      if (!accumulator[category]) {
        accumulator[category] = {
          count: 0,
          stock: 0,
          value: 0,
        }
      }
      accumulator[category].count += 1
      accumulator[category].stock += product.stock
      accumulator[category].value += product.stock * product.price
      return accumulator
    }, {}),
  ).map(([name, metrics]) => ({ name, ...metrics }))

  const inventoryValueByCategory = getInventoryValueByCategory(products)
  const productsByStockLevel = getProductsByStockLevel(products)
  const purchaseOrdersByStatus = getPurchaseOrdersByStatus(purchaseOrders)

  return (
    <section className="page">
      <PageHeader
        title="Reports"
        subtitle="Operational insights, trends, and inventory breakdowns."
      />

      <div className="stats-grid stats-grid--dashboard">
        <Stat label="Total Products" value={formatNumber(summaries.totalProducts)} />
        <Stat label="Total Vendors" value={formatNumber(vendors.length)} />
        <Stat label="Total Warehouses" value={formatNumber(warehouses.length)} />
        <Stat
          label="Total Purchase Orders"
          value={formatNumber(purchaseOrders.length)}
        />
        <Stat label="Total Shipments" value={formatNumber(shipments.length)} />
        <Stat label="Total Stock Units" value={formatNumber(summaries.totalStockUnits)} />
        <Stat
          label="Inventory Value"
          value={formatCurrency(summaries.totalInventoryValue)}
        />
        <Stat
          label="Low Stock Items"
          value={formatNumber(summaries.lowStockItems)}
          tone={summaries.lowStockItems > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="chart-grid">
        <article className="card">
          <h3>Inventory Value by Category</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={inventoryValueByCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <h3>Products by Stock Level</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={productsByStockLevel}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={96}
                  paddingAngle={4}
                  label
                >
                  {productsByStockLevel.map((entry, index) => (
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
              <BarChart data={purchaseOrdersByStatus}>
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

      <div className="dashboard-grid">
        <article className="card">
          <h3>Low Stock Report</h3>
          <Table
            rows={lowStockProducts}
            columns={[
              { key: 'id', header: 'ID' },
              { key: 'name', header: 'Product' },
              { key: 'category', header: 'Category' },
              {
                key: 'stock',
                header: 'Current Stock',
                render: (product) => formatNumber(product.stock),
              },
              {
                key: 'reorderLevel',
                header: 'Reorder Level',
                render: (product) => formatNumber(product.reorderLevel),
              },
              {
                key: 'status',
                header: 'Status',
                render: (product) => <StatusPill status={getProductStatus(product)} />,
              },
            ]}
            emptyTitle="No low stock items"
            emptyDescription="Great job! All products are currently above reorder threshold."
          />
        </article>

        <article className="card">
          <h3>Top Stocked Products</h3>
          {topStockedProducts.length ? (
            <ul className="metric-list">
              {topStockedProducts.map((product) => (
                <li key={product.id} className="metric-list__item">
                  <div>
                    <p className="metric-list__title">{product.name}</p>
                    <p className="metric-list__subtitle">{product.category}</p>
                  </div>
                  <strong>{formatNumber(product.stock)} units</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-inline">No products available to rank.</p>
          )}
        </article>
      </div>

      <article className="card">
        <h3>Category Summary</h3>
        <Table
          rows={categorySummary}
          rowKey="name"
          columns={[
            { key: 'name', header: 'Category' },
            {
              key: 'count',
              header: 'Products',
              render: (row) => formatNumber(row.count),
            },
            {
              key: 'stock',
              header: 'Total Units',
              render: (row) => formatNumber(row.stock),
            },
            {
              key: 'value',
              header: 'Inventory Value',
              render: (row) => formatCurrency(row.value),
            },
          ]}
          emptyTitle="No category summary available"
          emptyDescription="Add products to generate category-level report metrics."
        />
      </article>
    </section>
  )
}
