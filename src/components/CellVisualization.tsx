import Panel from './Panel'
import { parts } from '../parts'

type CellVisualizationProps = {
  placedPartCount: number
  onPlacePart: (partId: string) => void
}

export default function CellVisualization({ placedPartCount, onPlacePart }: CellVisualizationProps) {
  return (
    <Panel id="visualization" title="Assembly">
      <div
        className="assembly-area"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          onPlacePart(event.dataTransfer.getData('text/plain'))
        }}
      >
        <div className="assembly-status" role="status">
          <div className="assembly-sun" role="img" aria-label="Sun">☀</div>
          <p className="assembly-hint">
            {parts[placedPartCount]
              ? `Drop ${parts[placedPartCount].name.toLowerCase()} here`
              : 'Cell assembled'}
          </p>
          <div className="cell-stack">
            {parts.slice(0, placedPartCount).map((part) => (
              <div key={part.id} className="layer-row">
                <span className="layer-label">{part.name}</span>
                <div className={`cell-layer ${part.id}`} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}
