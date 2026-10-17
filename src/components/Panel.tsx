type PanelProps = {
  id: string
  title: string
}

// A shared frame keeps all three panels visually consistent.
export default function Panel({ id, title }: PanelProps) {
  return (
    <section className="panel" aria-labelledby={`${id}-title`}>
      <header className="panel-header">
        <h2 id={`${id}-title`}>{title}</h2>
      </header>
      <div className="panel-body" />
    </section>
  )
}
