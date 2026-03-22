export default function AppLayout({ children }) {
    return (
      <div className="app-shell">
        <aside className="sidebar">
          <h2>Supply Chain</h2>
        </aside>
        <main className="main-content">
          <div className="page-surface">{children}</div>
        </main>
      </div>
    )
  }