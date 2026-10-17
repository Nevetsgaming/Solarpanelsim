import Panel from './Panel'
import { parts } from '../parts'

type CellVisualizationProps = {
  placedPartCount: number
  onPlacePart: (partId: string) => void
  onSelectPart: (partId: string) => void
}

export default function CellVisualization({ placedPartCount, onPlacePart, onSelectPart }: CellVisualizationProps) {
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
        <button type="button" className="assembly-sun" aria-label="Learn about sunlight" onClick={() => onSelectPart('sun')}>☀</button>
        <div className="assembly-status" role="status">
          <p className="assembly-hint">
            {parts[placedPartCount]
              ? `Drop ${parts[placedPartCount].name.toLowerCase()} here`
              : 'Cell assembled'}
          </p>
          <div className="cell-stack">
            {parts.slice(0, placedPartCount).map((part) => (
              <div key={part.id} className="layer-row">
                <button type="button" className="layer-label" onClick={() => onSelectPart(part.id)}>{part.name}</button>
                {part.id === 'silicon' ? (
                  <div className="silicon">
                    <button type="button" className="silicon-emitter" onClick={() => onSelectPart('emitter')}>n-type emitter</button>
                    <button type="button" className="silicon-base" onClick={() => onSelectPart('base')}>p-type base</button>
                  </div>
                ) : (
                  <button type="button" className={`cell-layer ${part.id}`} aria-label={`Learn about ${part.name.toLowerCase()}`} onClick={() => onSelectPart(part.id)} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}
