import type { ReactNode } from 'react'

type PanelProps = {
  id: string
  step: string
  title: string
  description: string
  children: ReactNode
}

// A shared frame keeps all three panels visually consistent.
export default function Panel({ id, step, title, description, children }: PanelProps) {
  return (
    <section className="panel" aria-labelledby={`${id}-title`}>
      <header className="panel-header">
        <span className="step-number">{step}</span>
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="panel-body">{children}</div>
    </section>
  )
}
