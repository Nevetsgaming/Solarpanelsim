import Panel from './Panel'
import { parts } from '../parts'

type DesignPanelProps = {
  placedPartCount: number
  onPlacePart: (partId: string) => void
}

export default function DesignPanel({ placedPartCount, onPlacePart }: DesignPanelProps) {
  return (
    <Panel id="design" title="Parts">
      <div className="parts-list">
        {parts.map((part, index) => (
          <button
            key={part.id}
            className="part"
            type="button"
            draggable={index === placedPartCount}
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', part.id)
              event.dataTransfer.effectAllowed = 'copy'
            }}
            onClick={() => onPlacePart(part.id)}
          >
            {part.name}
          </button>
        ))}
        <p className="part-hint">Click a part to learn. Drag or click the next part to place it.</p>
      </div>
      <div className="power-box">
        <h3>Power</h3>
        <p className="power-value" aria-label="Power not yet calculated">— <span>W</span></p>
      </div>
    </Panel>
  )
}
