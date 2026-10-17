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
            disabled={index !== placedPartCount}
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', part.id)
              event.dataTransfer.effectAllowed = 'copy'
            }}
            onClick={() => onPlacePart(part.id)}
          >
            {part.name}
          </button>
        ))}
        <p className="part-hint">Drag into the middle, or click to place.</p>
      </div>
    </Panel>
  )
}
