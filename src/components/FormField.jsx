export default function FormField({ label, children }) {
    return (
      <label>
        <span>{label}</span>
        {children}
      </label>
    )
  }