export function EmptyState({ title = 'No data', description }) {
    return (
      <div>
        <strong>{title}</strong>
        {description ? <p>{description}</p> : null}
      </div>
    )
  }
  
  export function TableToolbar({ actions }) {
    return <div>{actions}</div>
  }
  
  export default function Table({ children }) {
    return <div>{children}</div>
  }