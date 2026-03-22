export default function PageHeader({ title, subtitle, actions }) {
    return (
      <header>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {actions ? <div>{actions}</div> : null}
      </header>
    )
  }