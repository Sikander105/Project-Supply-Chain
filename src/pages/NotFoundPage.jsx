import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="page page--centered">
      <article className="card empty-state">
        <p className="empty-state__eyebrow" style={{ marginBottom: '0.4rem' }}>
          404
        </p>
        <h3 style={{ marginBottom: '1.5rem' }}>Page not found</h3>
        <p style={{ marginBottom: '0' }}>
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link className="button" to="/dashboard" style={{ marginTop: '1.5rem' }}>
          Go to dashboard
        </Link>
      </article>
    </section>
  )
}